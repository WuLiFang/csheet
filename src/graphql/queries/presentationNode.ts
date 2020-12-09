// Code Generated from [base.ts.gotmpl node.gotmpl], DO NOT EDIT.
import {
  presentationNode,
  presentationNodeVariables,
} from '@/graphql/types/presentationNode';
import {
  OperationVariables,
  QueryOptions,
  ApolloQueryResult,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';

export { presentationNodeVariables, presentationNode };
export type Presentation = presentationNode['node'] & {
  __typename: 'Presentation';
};

function castNode(
  node: presentationNode['node'] | null | undefined
): Presentation | undefined {
  return node?.__typename === 'Presentation' ? node : undefined;
}

export async function query(
  variables: presentationNodeVariables,
  options?: Omit<QueryOptions<presentationNodeVariables>, 'query' | 'variables'>
): Promise<ApolloQueryResult<presentationNode>> {
  return await apolloClient.query<presentationNode, presentationNodeVariables>({
    ...options,
    query: require('./presentationNode.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<presentationNode, presentationNodeVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<presentationNode, OperationVariables> &
  ThisType<V> {
  return {
    ...o,
    query: require('./presentationNode.gql'),
    update(data): Presentation | undefined {
      return castNode(data.node);
    },
  } as VueApolloQueryDefinition<presentationNode, OperationVariables>;
}

export async function findById(id: string): Promise<Presentation | undefined> {
  if (!id) {
    return;
  }
  return castNode((await query({ id })).data.node);
}
