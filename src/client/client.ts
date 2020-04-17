import { app } from '@/main';
import { locale } from '@/plugins/i18n';
import { IdGetterObj, InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { ErrorResponse, onError } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { GraphQLError } from 'graphql';

function getErrorMessage(e: GraphQLError): string {
  let msg = e.extensions?.locales?.[locale] ?? e.message;
  return msg;
}

const httpLink: HttpLink = new HttpLink({
  uri: '/api',
});

// Create the subscription websocket link
const wsLink = new WebSocketLink({
  uri: `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
    location.host
  }/api`,
  options: {
    reconnect: true,
  },
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);
const linkErrorAfterWare: ApolloLink = onError(
  ({ graphQLErrors }: ErrorResponse): void => {
    if (graphQLErrors) {
      for (const i of graphQLErrors) {
        app.$emit('app-message', {
          text: getErrorMessage(i),
          class: 'text-red-700',
        });
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
  }
);
const cache: InMemoryCache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      node: (
        _: object,
        args: {
          [argName: string]: string | undefined;
        },
        { getCacheKey }: { getCacheKey(options: object): string }
      ): string => {
        return getCacheKey({ id: args.id });
      },
    },
  },
  // fragmentMatcher:
  dataIdFromObject: (i: IdGetterObj): string | undefined => i.id,
});

export const apolloClient: ApolloClient<{}> = new ApolloClient({
  cache,
  link: linkErrorAfterWare.concat(link),
});