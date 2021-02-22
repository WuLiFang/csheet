// Code Generated from [base.ts.gotmpl clientConfig.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  clientConfig,
  clientConfigVariables,
} from '@/graphql/types/clientConfig';
import {
  OperationVariables,
  QueryOptions,
  WatchQueryOptions,
  ApolloQueryResult,
  ObservableQuery,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';
import { ref, Ref, watch, onUnmounted } from '@vue/composition-api';
import { computed } from '@vue/composition-api';

export { clientConfigVariables, clientConfig };
export type Config = NonNullable<clientConfig['clientConfig']>;
const defaultConfig: Config = {
  __typename: 'ClientConfig',
  sentryDSN: null,
  issueTrackerURL: null,
  enableCGTeamwork: false,
  folderInclude: [],
};

export async function query(
  variables: clientConfigVariables,
  options?: Omit<QueryOptions<clientConfigVariables>, 'query' | 'variables'>
): Promise<ApolloQueryResult<clientConfig>> {
  return await apolloClient.query<clientConfig, clientConfigVariables>({
    ...options,
    query: require('./clientConfig.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<clientConfig, clientConfigVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<clientConfig, OperationVariables> & ThisType<V> {
  return {
    ...o,
    query: require('./clientConfig.gql'),
  } as VueApolloQueryDefinition<clientConfig, OperationVariables>;
}

export function useQuery(
  variables: Ref<clientConfigVariables>,
  options?: Ref<
    Omit<WatchQueryOptions<clientConfigVariables>, 'query' | 'variables'> & {
      skip?: boolean;
      loadingCount?: Ref<number>;
    }
  >
): {
  data: Ref<clientConfig | undefined>;
  query: Ref<ObservableQuery<clientConfig, clientConfigVariables> | undefined>;
  version: Ref<number>;
  config: Ref<Config>;
} {
  const data = ref<clientConfig | undefined>();
  const o = {
    query: require('./clientConfig.gql'),
  };
  const version = ref(0);

  const query = ref<
    ObservableQuery<clientConfig, clientConfigVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    query.value = apolloClient.watchQuery<clientConfig, clientConfigVariables>({
      ...options?.value,
      ...o,
      variables: variables.value,
    });
    const sub = query.value.subscribe((value) => {
      data.value = value.data;
      if (options?.value.loadingCount != null) {
        options.value.loadingCount.value += value.loading ? 1 : -1;
      }
      version.value += 1;
    });
    cleanup.push(() => {
      sub.unsubscribe();
    });
  };
  const stop = () => {
    if (!query.value) {
      return;
    }
    query.value = undefined;
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  };

  onUnmounted(() => {
    stop();
  });
  watch(
    () => options?.value.skip,
    (v) => {
      if (v) {
        stop();
      } else {
        start();
      }
    },
    { immediate: true }
  );
  watch(
    () => variables.value,
    (n) => {
      query.value?.refetch(n);
    }
  );
  watch(
    () => options?.value,
    (n) => {
      query.value?.setOptions({ ...n, ...o });
    }
  );
  return {
    data,
    query,
    version,
    config: computed(() => data.value?.clientConfig ?? defaultConfig),
  };
}
