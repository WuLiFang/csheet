// Code Generated from [base.ts.gotmpl node.gotmpl], DO NOT EDIT.
import {
  collectionNode,
  collectionNodeVariables,
} from '@/graphql/types/collectionNode';
import {
  OperationVariables,
  QueryOptions,
  ApolloQueryResult,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';

export { collectionNodeVariables, collectionNode };
export type Collection = collectionNode['node'] & { __typename: 'Collection' };

function castNode(
  node: collectionNode['node'] | null | undefined
): Collection | undefined {
  return node?.__typename === 'Collection' ? node : undefined;
}

export async function query(
  variables: collectionNodeVariables,
  options?: Omit<QueryOptions<collectionNodeVariables>, 'query' | 'variables'>
): Promise<ApolloQueryResult<collectionNode>> {
  return await apolloClient.query<collectionNode, collectionNodeVariables>({
    ...options,
    query: require('./collectionNode.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<collectionNode, collectionNodeVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<collectionNode, OperationVariables> & ThisType<V> {
  return {
    ...o,
    query: require('./collectionNode.gql'),
    update(data): Collection | undefined {
      return castNode(data.node);
    },
  } as VueApolloQueryDefinition<collectionNode, OperationVariables>;
}

export async function findById(id: string): Promise<Collection | undefined> {
  if (!id) {
    return;
  }
  return castNode((await query({ id })).data.node);
}
