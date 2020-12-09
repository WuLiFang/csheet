// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
import {
  deleteCGTeamworkNote,
  deleteCGTeamworkNoteVariables,
} from '@/graphql/types/deleteCGTeamworkNote';
import { FetchResult } from 'apollo-link';
import { MutationOptions } from 'apollo-client';
import { apolloClient } from '@/client';

export { deleteCGTeamworkNoteVariables, deleteCGTeamworkNote };

export async function mutate(
  variables: deleteCGTeamworkNoteVariables,
  options?: Omit<
    MutationOptions<deleteCGTeamworkNote, deleteCGTeamworkNoteVariables>,
    'mutation' | 'variables'
  >
): Promise<FetchResult<deleteCGTeamworkNote>> {
  return await apolloClient.mutate<
    deleteCGTeamworkNote,
    deleteCGTeamworkNoteVariables
  >({
    ...options,
    mutation: require('./deleteCGTeamworkNote.gql'),
    variables,
  });
}
