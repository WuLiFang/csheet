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
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    query.value = apolloClient.watchQuery<
      collectionCGTeamworkNotes,
      collectionCGTeamworkNotesVariables
    >({
      ...options?.value,
      ...o,
      variables: variables.value,
    });
    const sub = query.value.subscribe((value) => {
      data.value = value.data;
      if (options?.value.loadingCount != null) {
        options.value.loadingCount.value += value.loading ? 1 : -1;
      }
      version.value += 1;
    });
    cleanup.push(() => {
      sub.unsubscribe();
    });
  };
  const stop = () => {
    if (!query.value) {
      return;
    }
    query.value = undefined;
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  };
  watch(
    () => variables.value,
    (n) => {
      query.value?.refetch(n);
    }
  );
  watch(
    () => options?.value,
    (n) => {
      query.value?.setOptions({ ...n, ...o });
    }
  );
  onUnmounted(() => {
    stop();
  });
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
