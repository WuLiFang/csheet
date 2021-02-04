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
    Omit<WatchQueryOptions<cgteamworkFlowsVariables>, 'query' | 'variables'>
  >
): {
  data: Ref<cgteamworkFlows | undefined>;
  query: ObservableQuery<cgteamworkFlows, cgteamworkFlowsVariables>;
} {
  const data = ref<cgteamworkFlows | undefined>();
  const o = {
    query: require('./cgteamworkFlows.gql'),
  };
  const q = apolloClient.watchQuery<cgteamworkFlows, cgteamworkFlowsVariables>({
    ...options?.value,
    ...o,
    variables: variables.value,
  });
  watch(
    () => variables.value,
    async n => {
      await q.setVariables(n);
    }
  );
  watch(
    () => options?.value,
    n => {
      q.setOptions({ ...n, ...o });
    }
  );
  const sub = q.subscribe(value => {
    data.value = value.data;
  });
  onUnmounted(() => {
    sub.unsubscribe();
  });
  const query = q;
  return {
    data,
    query,
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
