import { error } from '@/message';
import { locale } from '@/plugins/i18n';
import * as sentry from '@sentry/browser';
import {
  IdGetterObj,
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import {
  ApolloLink,
  FetchResult,
  NextLink,
  Observable,
  Operation,
  split,
} from 'apollo-link';
import { ErrorResponse, onError } from 'apollo-link-error';
import { createPersistedQueryLink } from 'apollo-link-persisted-queries';
import { WebSocketLink } from 'apollo-link-ws';
import { createUploadLink } from 'apollo-upload-client';
import { getMainDefinition } from 'apollo-utilities';
import { GraphQLError } from 'graphql';
import { SubscriptionClient } from 'subscriptions-transport-ws';

if (process.env.NODE_ENV === 'development') {
  if (location.pathname === '/index.static.html') {
    throw new Error(
      'should not import client/client.ts in static version, this is a side-effect module'
    );
  }
}

function getErrorMessage(e: GraphQLError): string {
  const msg = e.extensions?.locales?.[locale] ?? e.message;
  return msg;
}

const httpLink = createUploadLink({
  uri: '/api',
});

// Create the subscription websocket link
const wsClient = new SubscriptionClient(
  `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/api`,
  {
    reconnect: true,
  }
);

/**
 * workaround to use persisted query with subscription
 * https://github.com/apollographql/apollo-link-persisted-queries/issues/18
 */
function patchSubscriptionClient(client: SubscriptionClient) {
  // make client to respect
  // `operation.getContext().http.includeQuery`
  // so apq link can work
  client.use([
    {
      applyMiddleware: (operation, next) => {
        if (operation.query) {
          operation.setContext({ query: operation.query });
        }
        const ctx = operation.getContext();
        const includeQuery: boolean | undefined = ctx?.http?.includeQuery;
        if (includeQuery) {
          operation.query = ctx.query;
        } else {
          delete operation.query;
        }
        next();
      },
    },
  ]);

  // allow empty query
  const c = (client as unknown) as Record<string, unknown>;
  const raw = c.checkOperationOptions as (...args: unknown[]) => unknown;
  c.checkOperationOptions = (...args: unknown[]) => {
    try {
      return raw(...args);
    } catch (err) {
      if (err instanceof Error && err.message === 'Must provide a query.') {
        return;
      }
      throw err;
    }
  };
}
patchSubscriptionClient(wsClient);

const wsLink = new WebSocketLink(wsClient);
const apqLink = createPersistedQueryLink();

class SentryLink extends ApolloLink {
  request(
    operation: Operation,
    forward?: NextLink
  ): Observable<FetchResult> | null {
    sentry.addBreadcrumb({
      category: 'graphql',
      message: operation.operationName,
      data: {
        variables: operation.variables,
        extensions: operation.extensions,
      },
    });
    return forward?.(operation) ?? null;
  }
}

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const splitLink = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  apqLink.concat(wsLink),
  apqLink.concat(httpLink)
);
const messageLink: ApolloLink = onError(
  ({ graphQLErrors, networkError, operation }: ErrorResponse): void => {
    if (graphQLErrors) {
      for (const i of graphQLErrors) {
        error(getErrorMessage(i));
        if (i.extensions?.traceback && process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error(
            i.extensions?.traceback +
              `\n  ${
                i.extensions?.originalError?.type
              }(${i.extensions?.originalError?.args?.join(',')})`
          );
        }
      }
    }
    if (networkError) {
      error(
        'response' in networkError
          ? `${operation.operationName}: ${networkError.response.status} ${networkError.response.statusText}`
          : `${operation.operationName}: ${networkError.message}`
      );
    }
  }
);

// https://www.apollographql.com/docs/react/data/fragments/
const fragmentMatcher: IntrospectionFragmentMatcher = new IntrospectionFragmentMatcher(
  {
    introspectionQueryResultData: require('@/graphql/fragment-types.json'),
  }
);

const cache: InMemoryCache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      node: (
        _: Record<string, unknown>,
        args: {
          [argName: string]: string | undefined;
        },
        {
          getCacheKey,
        }: { getCacheKey(options: Record<string, unknown>): string }
      ): string => {
        return getCacheKey({ id: args.id });
      },
    },
  },
  fragmentMatcher,
  dataIdFromObject: (i: IdGetterObj): string | undefined => i.id,
});

export const apolloClient: ApolloClient<unknown> = new ApolloClient({
  cache,
  link: ApolloLink.from([new SentryLink(), messageLink, splitLink]),
});
