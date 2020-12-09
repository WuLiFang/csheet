// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
import {
  folderOriginPrefix,
  folderOriginPrefixVariables,
} from '@/graphql/types/folderOriginPrefix';
import {
  OperationVariables,
  QueryOptions,
  ApolloQueryResult,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';

export { folderOriginPrefixVariables, folderOriginPrefix };

export async function query(
  variables: folderOriginPrefixVariables,
  options?: Omit<
    QueryOptions<folderOriginPrefixVariables>,
    'query' | 'variables'
  >
): Promise<ApolloQueryResult<folderOriginPrefix>> {
  return await apolloClient.query<
    folderOriginPrefix,
    folderOriginPrefixVariables
  >({
    ...options,
    query: require('./folderOriginPrefix.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<folderOriginPrefix, folderOriginPrefixVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<folderOriginPrefix, OperationVariables> &
  ThisType<V> {
  return {
    ...o,
    query: require('./folderOriginPrefix.gql'),
  } as VueApolloQueryDefinition<folderOriginPrefix, OperationVariables>;
}
