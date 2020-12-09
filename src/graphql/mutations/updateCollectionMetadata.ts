// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
import {
  updateCollectionMetadata,
  updateCollectionMetadataVariables,
} from '@/graphql/types/updateCollectionMetadata';
import { FetchResult } from 'apollo-link';
import { MutationOptions } from 'apollo-client';
import { apolloClient } from '@/client';

export { updateCollectionMetadataVariables, updateCollectionMetadata };

export async function mutate(
  variables: updateCollectionMetadataVariables,
  options?: Omit<
    MutationOptions<
      updateCollectionMetadata,
      updateCollectionMetadataVariables
    >,
    'mutation' | 'variables'
  >
): Promise<FetchResult<updateCollectionMetadata>> {
  return await apolloClient.mutate<
    updateCollectionMetadata,
    updateCollectionMetadataVariables
  >({
    ...options,
    mutation: require('./updateCollectionMetadata.gql'),
    variables,
  });
}
