// Code Generated from [base.ts.gotmpl array.gotmpl], DO NOT EDIT.
import { cgteamworkStatuses } from '@/graphql/types/cgteamworkStatuses';
import {
  OperationVariables,
  QueryOptions,
  ApolloQueryResult,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';
type cgteamworkStatusesVariables = never;

export { cgteamworkStatusesVariables, cgteamworkStatuses };
export type CGTeamworkStatus = NonNullable<
  cgteamworkStatuses['cgteamworkStatuses']
>[0];

export async function query(
  options?: Omit<
    QueryOptions<cgteamworkStatusesVariables>,
    'query' | 'variables'
  >
): Promise<ApolloQueryResult<cgteamworkStatuses>> {
  return await apolloClient.query<
    cgteamworkStatuses,
    cgteamworkStatusesVariables
  >({
    ...options,
    query: require('./cgteamworkStatuses.gql'),
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<cgteamworkStatuses, cgteamworkStatusesVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<cgteamworkStatuses, OperationVariables> &
  ThisType<V> {
  return {
    ...o,
    query: require('./cgteamworkStatuses.gql'),
    update(data): CGTeamworkStatus[] {
      return data.cgteamworkStatuses ?? [];
    },
  } as VueApolloQueryDefinition<cgteamworkStatuses, OperationVariables>;
}

export async function find(): Promise<CGTeamworkStatus[]> {
  const { data } = await apolloClient.query<
    cgteamworkStatuses,
    cgteamworkStatusesVariables
  >({
    query: require('./cgteamworkStatuses.gql'),
  });

  return data.cgteamworkStatuses ?? [];
}
