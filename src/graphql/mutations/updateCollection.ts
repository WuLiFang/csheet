// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
import {
  updateCollection,
  updateCollectionVariables,
} from '@/graphql/types/updateCollection';
import { FetchResult } from 'apollo-link';
import { MutationOptions } from 'apollo-client';
import { apolloClient } from '@/client';

export { updateCollectionVariables, updateCollection };

export async function mutate(
  variables: updateCollectionVariables,
  options?: Omit<
    MutationOptions<updateCollection, updateCollectionVariables>,
    'mutation' | 'variables'
  >
): Promise<FetchResult<updateCollection>> {
  return await apolloClient.mutate<updateCollection, updateCollectionVariables>(
    {
      ...options,
      mutation: require('./updateCollection.gql'),
      variables,
    }
  );
}
