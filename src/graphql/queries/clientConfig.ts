// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
import {
  clientConfig,
  clientConfigVariables,
} from '@/graphql/types/clientConfig';
import {
  OperationVariables,
  QueryOptions,
  ApolloQueryResult,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';

export { clientConfigVariables, clientConfig };

export async function query(
  variables: clientConfigVariables,
  options?: Omit<QueryOptions<clientConfigVariables>, 'query' | 'variables'>
): Promise<ApolloQueryResult<clientConfig>> {
  return await apolloClient.query<clientConfig, clientConfigVariables>({
    ...options,
    query: require('./clientConfig.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<clientConfig, clientConfigVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<clientConfig, OperationVariables> & ThisType<V> {
  return {
    ...o,
    query: require('./clientConfig.gql'),
  } as VueApolloQueryDefinition<clientConfig, OperationVariables>;
}
