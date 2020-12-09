// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
import {
  collectFromFolder,
  collectFromFolderVariables,
} from '@/graphql/types/collectFromFolder';
import { FetchResult } from 'apollo-link';
import { MutationOptions } from 'apollo-client';
import { apolloClient } from '@/client';

export { collectFromFolderVariables, collectFromFolder };

export async function mutate(
  variables: collectFromFolderVariables,
  options?: Omit<
    MutationOptions<collectFromFolder, collectFromFolderVariables>,
    'mutation' | 'variables'
  >
): Promise<FetchResult<collectFromFolder>> {
  return await apolloClient.mutate<
    collectFromFolder,
    collectFromFolderVariables
  >({
    ...options,
    mutation: require('./collectFromFolder.gql'),
    variables,
  });
}
