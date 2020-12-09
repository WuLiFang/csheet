// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
import {
  createCGTeamworkNote,
  createCGTeamworkNoteVariables,
} from '@/graphql/types/createCGTeamworkNote';
import { FetchResult } from 'apollo-link';
import { MutationOptions } from 'apollo-client';
import { apolloClient } from '@/client';

export { createCGTeamworkNoteVariables, createCGTeamworkNote };

export async function mutate(
  variables: createCGTeamworkNoteVariables,
  options?: Omit<
    MutationOptions<createCGTeamworkNote, createCGTeamworkNoteVariables>,
    'mutation' | 'variables'
  >
): Promise<FetchResult<createCGTeamworkNote>> {
  return await apolloClient.mutate<
    createCGTeamworkNote,
    createCGTeamworkNoteVariables
  >({
    ...options,
    mutation: require('./createCGTeamworkNote.gql'),
    variables,
  });
}
