// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  collectionStats,
  collectionStatsVariables,
} from '@/graphql/types/collectionStats';
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
import useCleanup from '@/composables/useCleanup';

export { collectionStatsVariables, collectionStats };

export async function query(
  variables: collectionStatsVariables,
  options?: Omit<QueryOptions<collectionStatsVariables>, 'query' | 'variables'>
): Promise<ApolloQueryResult<collectionStats>> {
  return await apolloClient.query<collectionStats, collectionStatsVariables>({
    ...options,
    query: require('./collectionStats.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<collectionStats, collectionStatsVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<collectionStats, OperationVariables> & ThisType<V> {
  return {
    ...o,
    query: require('./collectionStats.gql'),
  } as VueApolloQueryDefinition<collectionStats, OperationVariables>;
}

export function useQuery(
  variables: Ref<collectionStatsVariables>,
  options?: Ref<
    Omit<WatchQueryOptions<collectionStatsVariables>, 'query' | 'variables'> & {
      skip?: boolean;
      loadingCount?: Ref<number>;
    }
  >
): {
  data: Ref<collectionStats | undefined>;
  query: Ref<
    ObservableQuery<collectionStats, collectionStatsVariables> | undefined
  >;
  version: Ref<number>;
} {
  const data = ref<collectionStats | undefined>();
  const o = {
    query: require('./collectionStats.gql'),
  };
  const version = ref(0);

  const query = ref<
    ObservableQuery<collectionStats, collectionStatsVariables> | undefined
  >();
  const { cleanup, addCleanup } = useCleanup();
  const start = () => {
    if (query.value) {
      return;
    }
    const q = apolloClient.watchQuery<
      collectionStats,
      collectionStatsVariables
    >({
      ...options?.value,
      ...o,
      variables: variables.value,
    });
    const updateLoadingCount = () => {
      const loadingCount = options?.value.loadingCount;
      if (loadingCount == null) {
        return;
      }
      loadingCount.value += 1;
      q.result().finally(() => {
        loadingCount.value -= 1;
      });
    };
    updateLoadingCount();
    query.value = q;
    const sub = q.subscribe((value) => {
      data.value = value.data;
      if (value.loading) {
        updateLoadingCount();
      } else {
        version.value += 1;
      }
    });
    addCleanup(() => {
      sub.unsubscribe();
    });
  };
  const stop = () => {
    if (!query.value) {
      return;
    }
    query.value = undefined;
    cleanup();
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
    variables,
    (n) => {
      query.value?.refetch(n);
    },
    { deep: true }
  );
  watch(
    () => options?.value,
    (n) => {
      query.value?.setOptions({ ...n, ...o });
    },
    { deep: true }
  );
  return {
    data,
    query,
    version,
  };
}
