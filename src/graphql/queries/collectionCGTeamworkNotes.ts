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
import { ref, Ref, watch } from '@vue/composition-api';
import useCleanup from '@/composables/useCleanup';
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
    > & { skip?: boolean; loadingCount?: Ref<number> }
  >
): {
  data: Ref<collectionCGTeamworkNotes | undefined>;
  query: Ref<
    | ObservableQuery<
        collectionCGTeamworkNotes,
        collectionCGTeamworkNotesVariables
      >
    | undefined
  >;
  version: Ref<number>;
  node: Ref<Collection | undefined>;
} {
  const data = ref<collectionCGTeamworkNotes | undefined>();
  const o = {
    query: require('./collectionCGTeamworkNotes.gql'),
  };
  const version = ref(0);

  const query = ref<
    | ObservableQuery<
        collectionCGTeamworkNotes,
        collectionCGTeamworkNotesVariables
      >
    | undefined
  >();
  const { cleanup, addCleanup } = useCleanup();
  const start = () => {
    if (query.value) {
      return;
    }
    const q = apolloClient.watchQuery<
      collectionCGTeamworkNotes,
      collectionCGTeamworkNotesVariables
    >({
      ...options?.value,
      ...o,
      variables: variables.value,
    });
    const updateLoadingCount = () => {
      const loadingCount = options?.value.loadingCount;
      if (loadingCount == null) {
        return;
      }
      loadingCount.value += 1;
      q.result().finally(() => {
        loadingCount.value -= 1;
      });
    };
    updateLoadingCount();
    query.value = q;
    const sub = q.subscribe((value) => {
      data.value = value.data;
      if (value.loading) {
        updateLoadingCount();
      } else {
        version.value += 1;
      }
    });
    addCleanup(() => {
      sub.unsubscribe();
    });
  };
  const stop = () => {
    cleanup();
    query.value = undefined;
  };

  watch(
    () => options?.value.skip,
    (v) => {
      if (v) {
        stop();
      } else {
        start();
      }
    },
    { immediate: true }
  );
  watch(
    variables,
    (n) => {
      query.value?.refetch(n);
    },
    { deep: true }
  );
  watch(
    () => options?.value,
    (n) => {
      query.value?.setOptions({ ...n, ...o });
    },
    { deep: true }
  );
  return {
    data,
    query,
    version,
    node: computed(() => castNode(data.value?.node)),
  };
}

export async function findById(id: string): Promise<Collection | undefined> {
  if (!id) {
    return;
  }
  return castNode((await query({ id })).data.node);
}
