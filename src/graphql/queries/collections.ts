// Code Generated from [base.ts.gotmpl connection.gotmpl], DO NOT EDIT.
import { collections, collectionsVariables } from '@/graphql/types/collections';
import {
  OperationVariables,
  QueryOptions,
  ApolloQueryResult,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';
import extractNodes, { NodeType } from '@/utils/extractNodes';

export { collectionsVariables, collections };
export type Collection = NodeType<collections['collections']>;

export async function query(
  variables: collectionsVariables,
  options?: Omit<QueryOptions<collectionsVariables>, 'query' | 'variables'>
): Promise<ApolloQueryResult<collections>> {
  return await apolloClient.query<collections, collectionsVariables>({
    ...options,
    query: require('./collections.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<collections, collectionsVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<collections, OperationVariables> & ThisType<V> {
  return {
    ...o,
    query: require('./collections.gql'),
    update(data): Collection[] {
      return extractNodes(data.collections);
    },
  } as VueApolloQueryDefinition<collections, OperationVariables>;
}

export async function find(
  variables: collectionsVariables
): Promise<Collection[]> {
  return extractNodes((await query(variables)).data.collections);
}
