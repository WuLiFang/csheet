// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  folderOriginPrefix,
  folderOriginPrefixVariables,
} from '@/graphql/types/folderOriginPrefix';
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

export { folderOriginPrefixVariables, folderOriginPrefix };

export async function query(
  variables: folderOriginPrefixVariables,
  options?: Omit<
    QueryOptions<folderOriginPrefixVariables>,
    'query' | 'variables'
  >
): Promise<ApolloQueryResult<folderOriginPrefix>> {
  return await apolloClient.query<
    folderOriginPrefix,
    folderOriginPrefixVariables
  >({
    ...options,
    query: require('./folderOriginPrefix.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<folderOriginPrefix, folderOriginPrefixVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<folderOriginPrefix, OperationVariables> &
  ThisType<V> {
  return {
    ...o,
    query: require('./folderOriginPrefix.gql'),
  } as VueApolloQueryDefinition<folderOriginPrefix, OperationVariables>;
}

export function useQuery(
  variables: Ref<folderOriginPrefixVariables>,
  options?: Ref<
    Omit<
      WatchQueryOptions<folderOriginPrefixVariables>,
      'query' | 'variables'
    > & { skip?: boolean; loadingCount?: Ref<number> }
  >
): {
  data: Ref<folderOriginPrefix | undefined>;
  query: Ref<
    ObservableQuery<folderOriginPrefix, folderOriginPrefixVariables> | undefined
  >;
  version: Ref<number>;
} {
  const data = ref<folderOriginPrefix | undefined>();
  const o = {
    query: require('./folderOriginPrefix.gql'),
  };
  const version = ref(0);

  const query = ref<
    ObservableQuery<folderOriginPrefix, folderOriginPrefixVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    const q = apolloClient.watchQuery<
      folderOriginPrefix,
      folderOriginPrefixVariables
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
  };
}
