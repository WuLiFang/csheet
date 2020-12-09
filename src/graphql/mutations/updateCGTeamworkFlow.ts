// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
import {
  updateCGTeamworkFlow,
  updateCGTeamworkFlowVariables,
} from '@/graphql/types/updateCGTeamworkFlow';
import { FetchResult } from 'apollo-link';
import { MutationOptions } from 'apollo-client';
import { apolloClient } from '@/client';

export { updateCGTeamworkFlowVariables, updateCGTeamworkFlow };

export async function mutate(
  variables: updateCGTeamworkFlowVariables,
  options?: Omit<
    MutationOptions<updateCGTeamworkFlow, updateCGTeamworkFlowVariables>,
    'mutation' | 'variables'
  >
): Promise<FetchResult<updateCGTeamworkFlow>> {
  return await apolloClient.mutate<
    updateCGTeamworkFlow,
    updateCGTeamworkFlowVariables
  >({
    ...options,
    mutation: require('./updateCGTeamworkFlow.gql'),
    variables,
  });
}
