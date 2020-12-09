// Code Generated from [base.ts.gotmpl node.gotmpl], DO NOT EDIT.
import {
  collectionCGTeamworkNotes,
  collectionCGTeamworkNotesVariables,
} from '@/graphql/types/collectionCGTeamworkNotes';
import {
  OperationVariables,
  QueryOptions,
  ApolloQueryResult,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';

export { collectionCGTeamworkNotesVariables, collectionCGTeamworkNotes };
export type Collection = collectionCGTeamworkNotes['node'] & {
  __typename: 'Collection';
};

function castNode(
  node: collectionCGTeamworkNotes['node'] | null | undefined
): Collection | undefined {
  return node?.__typename === 'Collection' ? node : undefined;
}

export async function query(
  variables: collectionCGTeamworkNotesVariables,
  options?: Omit<
    QueryOptions<collectionCGTeamworkNotesVariables>,
    'query' | 'variables'
  >
): Promise<ApolloQueryResult<collectionCGTeamworkNotes>> {
  return await apolloClient.query<
    collectionCGTeamworkNotes,
    collectionCGTeamworkNotesVariables
  >({
    ...options,
    query: require('./collectionCGTeamworkNotes.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<
      collectionCGTeamworkNotes,
      collectionCGTeamworkNotesVariables
    >,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<collectionCGTeamworkNotes, OperationVariables> &
  ThisType<V> {
  return {
    ...o,
    query: require('./collectionCGTeamworkNotes.gql'),
    update(data): Collection | undefined {
      return castNode(data.node);
    },
  } as VueApolloQueryDefinition<collectionCGTeamworkNotes, OperationVariables>;
}

export async function findById(id: string): Promise<Collection | undefined> {
  if (!id) {
    return;
  }
  return castNode((await query({ id })).data.node);
}
