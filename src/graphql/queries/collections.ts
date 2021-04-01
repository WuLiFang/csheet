// Code Generated from [base.ts.gotmpl connection.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import { collections, collectionsVariables } from '@/graphql/types/collections';
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
import extractNodes, { NodeType } from '@/utils/extractNodes';
import { computed } from '@vue/composition-api';

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

export function useQuery(
  variables: Ref<collectionsVariables>,
  options?: Ref<
    Omit<WatchQueryOptions<collectionsVariables>, 'query' | 'variables'> & {
      skip?: boolean;
      loadingCount?: Ref<number>;
    }
  >
): {
  data: Ref<collections | undefined>;
  query: Ref<ObservableQuery<collections, collectionsVariables> | undefined>;
  version: Ref<number>;
  nodes: Ref<Collection[]>;
} {
  const data = ref<collections | undefined>();
  const o = {
    query: require('./collections.gql'),
  };
  const version = ref(0);

  const query = ref<
    ObservableQuery<collections, collectionsVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    const q = apolloClient.watchQuery<collections, collectionsVariables>({
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
    nodes: computed(() => extractNodes(data.value?.collections)),
  };
}

export async function find(
  variables: collectionsVariables
): Promise<Collection[]> {
  return extractNodes((await query(variables)).data.collections);
}
