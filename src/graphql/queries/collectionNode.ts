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
import { ref, Ref, watch, onUnmounted } from '@vue/composition-api';
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
    Omit<WatchQueryOptions<collectionNodeVariables>, 'query' | 'variables'> & {
      skip?: boolean;
      loadingCount?: Ref<number>;
    }
  >
): {
  data: Ref<collectionNode | undefined>;
  query: Ref<
    ObservableQuery<collectionNode, collectionNodeVariables> | undefined
  >;
  version: Ref<number>;
  node: Ref<Collection | undefined>;
} {
  const data = ref<collectionNode | undefined>();
  const o = {
    query: require('./collectionNode.gql'),
  };
  const version = ref(0);

  const query = ref<
    ObservableQuery<collectionNode, collectionNodeVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    const q = apolloClient.watchQuery<collectionNode, collectionNodeVariables>({
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
