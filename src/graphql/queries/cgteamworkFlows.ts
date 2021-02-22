// Code Generated from [base.ts.gotmpl array.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  cgteamworkFlows,
  cgteamworkFlowsVariables,
} from '@/graphql/types/cgteamworkFlows';
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

export { cgteamworkFlowsVariables, cgteamworkFlows };
export type CGTeamworkFlow = NonNullable<cgteamworkFlows['cgteamworkFlows']>[0];

export async function query(
  variables: cgteamworkFlowsVariables,
  options?: Omit<QueryOptions<cgteamworkFlowsVariables>, 'query' | 'variables'>
): Promise<ApolloQueryResult<cgteamworkFlows>> {
  return await apolloClient.query<cgteamworkFlows, cgteamworkFlowsVariables>({
    ...options,
    query: require('./cgteamworkFlows.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<cgteamworkFlows, cgteamworkFlowsVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<cgteamworkFlows, OperationVariables> & ThisType<V> {
  return {
    ...o,
    query: require('./cgteamworkFlows.gql'),
    update(data): CGTeamworkFlow[] {
      return data.cgteamworkFlows ?? [];
    },
  } as VueApolloQueryDefinition<cgteamworkFlows, OperationVariables>;
}

export function useQuery(
  variables: Ref<cgteamworkFlowsVariables>,
  options?: Ref<
    Omit<WatchQueryOptions<cgteamworkFlowsVariables>, 'query' | 'variables'> & {
      skip?: boolean;
      loadingCount?: Ref<number>;
    }
  >
): {
  data: Ref<cgteamworkFlows | undefined>;
  query: Ref<
    ObservableQuery<cgteamworkFlows, cgteamworkFlowsVariables> | undefined
  >;
  version: Ref<number>;
} {
  const data = ref<cgteamworkFlows | undefined>();
  const o = {
    query: require('./cgteamworkFlows.gql'),
  };
  const version = ref(0);

  const query = ref<
    ObservableQuery<cgteamworkFlows, cgteamworkFlowsVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    query.value = apolloClient.watchQuery<
      cgteamworkFlows,
      cgteamworkFlowsVariables
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
    version,
  };
}

export async function find(
  variables: cgteamworkFlowsVariables
): Promise<CGTeamworkFlow[]> {
  const { data } = await apolloClient.query<
    cgteamworkFlows,
    cgteamworkFlowsVariables
  >({
    query: require('./cgteamworkFlows.gql'),
    variables,
  });

  return data.cgteamworkFlows ?? [];
}
