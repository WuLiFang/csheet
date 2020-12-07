// Code Generated from [base.ts.gotmpl array.gotmpl], DO NOT EDIT.

import { cgteamworkStatuses, cgteamworkStatusesVariables } from '@/graphql/types/cgteamworkStatuses';
import { OperationVariables } from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from "@/client"

export { cgteamworkStatusesVariables, cgteamworkStatuses };
export type CGTeamworkStatus = NonNullable<cgteamworkStatuses['cgteamworkStatuses']>[0];

export default function cgteamworkStatusesQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<cgteamworkStatuses, cgteamworkStatusesVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<cgteamworkStatuses, OperationVariables> & ThisType<V> {
  return {
    ...o,
    query: require('./cgteamworkStatuses.gql'),
    update(data): CGTeamworkStatus[] {
      return data.cgteamworkStatuses ?? [];
    },
  } as VueApolloQueryDefinition<cgteamworkStatuses, OperationVariables>;
}

export async function find(variables: cgteamworkStatusesVariables): Promise<CGTeamworkStatus[]> {
  const { data } = await apolloClient.query<cgteamworkStatuses, cgteamworkStatusesVariables>({
    query: require('./cgteamworkStatuses.gql'),
    variables,
  });

  return data.cgteamworkStatuses ?? [];
}
