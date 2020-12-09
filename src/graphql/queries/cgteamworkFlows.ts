// Code Generated from [base.ts.gotmpl array.gotmpl], DO NOT EDIT.
import {
  cgteamworkFlows,
  cgteamworkFlowsVariables,
} from '@/graphql/types/cgteamworkFlows';
import {
  OperationVariables,
  QueryOptions,
  ApolloQueryResult,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';

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
