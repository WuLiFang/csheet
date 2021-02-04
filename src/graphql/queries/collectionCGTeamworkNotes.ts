// Code Generated from [base.ts.gotmpl node.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  collectionCGTeamworkNotes,
  collectionCGTeamworkNotesVariables,
} from '@/graphql/types/collectionCGTeamworkNotes';
import {
  OperationVariables,
  QueryOptions,
  WatchQueryOptions,
  ApolloQueryResult,
  ObservableQuery,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';
import { ref, Ref, watch, onUnmounted } from '@vue/composition-api';
import { computed } from '@vue/composition-api';

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

export function useQuery(
  variables: Ref<collectionCGTeamworkNotesVariables>,
  options?: Ref<
    Omit<
      WatchQueryOptions<collectionCGTeamworkNotesVariables>,
      'query' | 'variables'
    >
  >
): {
  data: Ref<collectionCGTeamworkNotes | undefined>;
  query: ObservableQuery<
    collectionCGTeamworkNotes,
    collectionCGTeamworkNotesVariables
  >;
  node: Ref<Collection | undefined>;
} {
  const data = ref<collectionCGTeamworkNotes | undefined>();
  const o = {
    query: require('./collectionCGTeamworkNotes.gql'),
  };
  const q = apolloClient.watchQuery<
    collectionCGTeamworkNotes,
    collectionCGTeamworkNotesVariables
  >({
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
  onUnmounted(() => {
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
