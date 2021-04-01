// Code Generated from [base.ts.gotmpl array.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  cgteamworkPipelines,
  cgteamworkPipelinesVariables,
} from '@/graphql/types/cgteamworkPipelines';
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

export { cgteamworkPipelinesVariables, cgteamworkPipelines };
export type CGTeamworkPipeline = NonNullable<
  cgteamworkPipelines['cgteamworkPipelines']
>[0];

export async function query(
  variables: cgteamworkPipelinesVariables,
  options?: Omit<
    QueryOptions<cgteamworkPipelinesVariables>,
    'query' | 'variables'
  >
): Promise<ApolloQueryResult<cgteamworkPipelines>> {
  return await apolloClient.query<
    cgteamworkPipelines,
    cgteamworkPipelinesVariables
  >({
    ...options,
    query: require('./cgteamworkPipelines.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<cgteamworkPipelines, cgteamworkPipelinesVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<cgteamworkPipelines, OperationVariables> &
  ThisType<V> {
  return {
    ...o,
    query: require('./cgteamworkPipelines.gql'),
    update(data): CGTeamworkPipeline[] {
      return data.cgteamworkPipelines ?? [];
    },
  } as VueApolloQueryDefinition<cgteamworkPipelines, OperationVariables>;
}

export function useQuery(
  variables: Ref<cgteamworkPipelinesVariables>,
  options?: Ref<
    Omit<
      WatchQueryOptions<cgteamworkPipelinesVariables>,
      'query' | 'variables'
    > & { skip?: boolean; loadingCount?: Ref<number> }
  >
): {
  data: Ref<cgteamworkPipelines | undefined>;
  query: Ref<
    | ObservableQuery<cgteamworkPipelines, cgteamworkPipelinesVariables>
    | undefined
  >;
  version: Ref<number>;
} {
  const data = ref<cgteamworkPipelines | undefined>();
  const o = {
    query: require('./cgteamworkPipelines.gql'),
  };
  const version = ref(0);

  const query = ref<
    | ObservableQuery<cgteamworkPipelines, cgteamworkPipelinesVariables>
    | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    const q = apolloClient.watchQuery<
      cgteamworkPipelines,
      cgteamworkPipelinesVariables
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

export async function find(
  variables: cgteamworkPipelinesVariables
): Promise<CGTeamworkPipeline[]> {
  const { data } = await apolloClient.query<
    cgteamworkPipelines,
    cgteamworkPipelinesVariables
  >({
    query: require('./cgteamworkPipelines.gql'),
    variables,
  });

  return data.cgteamworkPipelines ?? [];
}
