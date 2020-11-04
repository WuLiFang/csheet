import { apolloClient } from '@/client/client';
import {
  createCGTeamworkNote,
  createCGTeamworkNoteVariables,
} from '@/graphql/types/createCGTeamworkNote';
import {
  deleteCGTeamworkNote,
  deleteCGTeamworkNoteVariables,
} from '@/graphql/types/deleteCGTeamworkNote';
import {
  updateCGTeamworkFlow,
  updateCGTeamworkFlowVariables,
} from '@/graphql/types/updateCGTeamworkFlow';
import {
  updateCollectionMetadata,
  updateCollectionMetadataVariables,
} from '@/graphql/types/updateCollectionMetadata';

export async function updateMetadata(
  variables: updateCollectionMetadataVariables
): Promise<void> {
  await apolloClient.mutate<updateCollectionMetadata>({
    mutation: require('@/graphql/mutations/updateCollectionMetadata.gql'),
    variables,
  });
}

export async function updateCGTeamworkFlow(
  variables: updateCGTeamworkFlowVariables
): Promise<void> {
  await apolloClient.mutate<updateCGTeamworkFlow>({
    mutation: require('@/graphql/mutations/updateCGTeamworkFlow.gql'),
    variables,
  });
}

export async function createCGTeamworkNote(
  variables: createCGTeamworkNoteVariables
): Promise<void> {
  await apolloClient.mutate<createCGTeamworkNote>({
    mutation: require('@/graphql/mutations/createCGTeamworkNote.gql'),
    variables,
  });
}

export async function deleteCGTeamworkNote(
  variables: deleteCGTeamworkNoteVariables
): Promise<void> {
  await apolloClient.mutate<deleteCGTeamworkNote>({
    mutation: require('@/graphql/mutations/deleteCGTeamworkNote.gql'),
    variables,
  });
}
