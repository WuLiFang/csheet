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
    }
  >
): {
  data: Ref<collections | undefined>;
  query: Ref<ObservableQuery<collections, collectionsVariables> | undefined>;
  nodes: Ref<Collection[]>;
} {
  const data = ref<collections | undefined>();
  const o = {
    query: require('./collections.gql'),
  };

  const query = ref<
    ObservableQuery<collections, collectionsVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    query.value = apolloClient.watchQuery<collections, collectionsVariables>({
      ...options?.value,
      ...o,
      variables: variables.value,
    });
    const sub = query.value.subscribe((value) => {
      data.value = value.data;
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
      query.value?.setVariables(n);
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
    nodes: computed(() => extractNodes(data.value?.collections)),
  };
}

export async function find(
  variables: collectionsVariables
): Promise<Collection[]> {
  return extractNodes((await query(variables)).data.collections);
}
