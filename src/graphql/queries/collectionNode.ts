// Code Generated from [base.ts.gotmpl node.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  collectionNode,
  collectionNodeVariables,
} from '@/graphql/types/collectionNode';
import {
  OperationVariables,
  QueryOptions,
  WatchQueryOptions,
  ApolloQueryResult,
  ObservableQuery,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';
import { ref, Ref, watch, onDeactivated } from '@vue/composition-api';
import { computed } from '@vue/composition-api';

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

export function useQuery(
  variables: Ref<collectionNodeVariables>,
  options?: Ref<
    Omit<WatchQueryOptions<collectionNodeVariables>, 'query' | 'variables'>
  >
): {
  data: Ref<collectionNode | undefined>;
  query: ObservableQuery<collectionNode, collectionNodeVariables>;
  node: Ref<Collection | undefined>;
} {
  const data = ref<collectionNode | undefined>();
  const o = {
    query: require('./collectionNode.gql'),
  };
  const q = apolloClient.watchQuery<collectionNode, collectionNodeVariables>({
    ...options?.value,
    ...o,
    variables: variables.value,
  });
  watch(
    () => variables.value,
    async n => {
      await q.setVariables(n);
    }
  );
  watch(
    () => options?.value,
    n => {
      q.setOptions({ ...n, ...o });
    }
  );
  const sub = q.subscribe(value => {
    data.value = value.data;
  });
  onDeactivated(() => {
    sub.unsubscribe();
  });
  const query = q;
  return {
    data,
    query,
    node: computed(() => castNode(data.value?.node)),
  };
}

export async function findById(id: string): Promise<Collection | undefined> {
  if (!id) {
    return;
  }
  return castNode((await query({ id })).data.node);
}
