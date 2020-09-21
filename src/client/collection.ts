import { apolloClient } from '@/client/client';
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
