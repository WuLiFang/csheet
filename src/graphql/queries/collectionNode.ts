// Code Generated from [base.ts.gotmpl node.gotmpl], DO NOT EDIT.

import { collectionNode, collectionNodeVariables } from '@/graphql/types/collectionNode';
import { OperationVariables } from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from "@/client"

export { collectionNodeVariables, collectionNode };
export type Collection = collectionNode['node'] & { __typename: 'Collection' };

function castNode(node: collectionNode['node'] | null | undefined ): Collection | undefined {
    return node?.__typename === 'Collection' ? node : undefined;
}

export default function collectionNodeQuery<V>(
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
  const { data } = await apolloClient.query<collectionNode, collectionNodeVariables>({
    query: require('./collectionNode.gql'),
    variables: { id },
  });

  return castNode(data.node);
}
