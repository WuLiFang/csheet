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
    > & { skip?: boolean }
  >
): {
  data: Ref<cgteamworkPipelines | undefined>;
  query: Ref<
    | ObservableQuery<cgteamworkPipelines, cgteamworkPipelinesVariables>
    | undefined
  >;
} {
  const data = ref<cgteamworkPipelines | undefined>();
  const o = {
    query: require('./cgteamworkPipelines.gql'),
  };

  const query = ref<
    | ObservableQuery<cgteamworkPipelines, cgteamworkPipelinesVariables>
    | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    query.value = apolloClient.watchQuery<
      cgteamworkPipelines,
      cgteamworkPipelinesVariables
    >({
      ...options?.value,
      ...o,
      variables: variables.value,
    });
    const sub = query.value.subscribe((value) => {
      data.value = value.data;
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
