// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
import {
  updatePresentationMetadata,
  updatePresentationMetadataVariables,
} from '@/graphql/types/updatePresentationMetadata';
import { FetchResult } from 'apollo-link';
import { MutationOptions } from 'apollo-client';
import { apolloClient } from '@/client';

export { updatePresentationMetadataVariables, updatePresentationMetadata };

export async function mutate(
  variables: updatePresentationMetadataVariables,
  options?: Omit<
    MutationOptions<
      updatePresentationMetadata,
      updatePresentationMetadataVariables
    >,
    'mutation' | 'variables'
  >
): Promise<FetchResult<updatePresentationMetadata>> {
  return await apolloClient.mutate<
    updatePresentationMetadata,
    updatePresentationMetadataVariables
  >({
    ...options,
    mutation: require('./updatePresentationMetadata.gql'),
    variables,
  });
}
