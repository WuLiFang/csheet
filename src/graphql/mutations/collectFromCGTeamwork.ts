// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
import {
  collectFromCGTeamwork,
  collectFromCGTeamworkVariables,
} from '@/graphql/types/collectFromCGTeamwork';
import { FetchResult } from 'apollo-link';
import { MutationOptions } from 'apollo-client';
import { apolloClient } from '@/client';

export { collectFromCGTeamworkVariables, collectFromCGTeamwork };

export async function mutate(
  variables: collectFromCGTeamworkVariables,
  options?: Omit<
    MutationOptions<collectFromCGTeamwork, collectFromCGTeamworkVariables>,
    'mutation' | 'variables'
  >
): Promise<FetchResult<collectFromCGTeamwork>> {
  return await apolloClient.mutate<
    collectFromCGTeamwork,
    collectFromCGTeamworkVariables
  >({
    ...options,
    mutation: require('./collectFromCGTeamwork.gql'),
    variables,
  });
}
