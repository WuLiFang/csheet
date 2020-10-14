import { apolloClient } from '@/client/client';
import {
  updatePresentationMetadata,
  updatePresentationMetadataVariables,
} from '@/graphql/types/updatePresentationMetadata';

export async function updateMetadata(
  variables: updatePresentationMetadataVariables
): Promise<void> {
  await apolloClient.mutate<updatePresentationMetadata>({
    mutation: require('@/graphql/mutations/updatePresentationMetadata.gql'),
    variables,
  });
}
