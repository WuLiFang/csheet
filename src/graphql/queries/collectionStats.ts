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
} {
  const data = ref<collectionStats | undefined>();
  const o = {
    query: require('./collectionStats.gql'),
  };

  const query = ref<
    ObservableQuery<collectionStats, collectionStatsVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    query.value = apolloClient.watchQuery<
      collectionStats,
      collectionStatsVariables
    >({
      ...options?.value,
      ...o,
      variables: variables.value,
    });
    const sub = query.value.subscribe((value) => {
      data.value = value.data;
      if (options?.value.loadingCount != null) {
        options.value.loadingCount.value += value.loading ? 1 : -1;
      }
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
  watch(
    () => variables.value,
    (n) => {
      query.value?.setVariables(n);
    }
  );
  watch(
    () => options?.value,
    (n) => {
      query.value?.setOptions({ ...n, ...o });
    }
  );
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
  return {
    data,
    query,
  };
}
