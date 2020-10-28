import { apolloClient } from '@/client/client';
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
