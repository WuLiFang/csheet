// Code Generated from [base.ts.gotmpl connection.gotmpl StringConnection.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  collectionTags,
  collectionTagsVariables,
} from '@/graphql/types/collectionTags';
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

export { collectionTagsVariables, collectionTags };
type _ = NodeType<never>;
export type CollectionTag = string;

export async function query(
  variables: collectionTagsVariables,
  options?: Omit<QueryOptions<collectionTagsVariables>, 'query' | 'variables'>
): Promise<ApolloQueryResult<collectionTags>> {
  return await apolloClient.query<collectionTags, collectionTagsVariables>({
    ...options,
    query: require('./collectionTags.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<collectionTags, collectionTagsVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<collectionTags, OperationVariables> & ThisType<V> {
  return {
    ...o,
    query: require('./collectionTags.gql'),
    update(data): CollectionTag[] {
      return extractNodes(data.collectionTags);
    },
  } as VueApolloQueryDefinition<collectionTags, OperationVariables>;
}

export function useQuery(
  variables: Ref<collectionTagsVariables>,
  options?: Ref<
    Omit<WatchQueryOptions<collectionTagsVariables>, 'query' | 'variables'> & {
      skip?: boolean;
      loadingCount?: Ref<number>;
    }
  >
): {
  data: Ref<collectionTags | undefined>;
  query: Ref<
    ObservableQuery<collectionTags, collectionTagsVariables> | undefined
  >;
  nodes: Ref<CollectionTag[]>;
} {
  const data = ref<collectionTags | undefined>();
  const o = {
    query: require('./collectionTags.gql'),
  };

  const query = ref<
    ObservableQuery<collectionTags, collectionTagsVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    query.value = apolloClient.watchQuery<
      collectionTags,
      collectionTagsVariables
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
    nodes: computed(() => extractNodes(data.value?.collectionTags)),
  };
}

export async function find(
  variables: collectionTagsVariables
): Promise<CollectionTag[]> {
  return extractNodes((await query(variables)).data.collectionTags);
}
