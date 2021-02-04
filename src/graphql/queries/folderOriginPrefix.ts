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
    Omit<WatchQueryOptions<folderOriginPrefixVariables>, 'query' | 'variables'>
  >
): {
  data: Ref<folderOriginPrefix | undefined>;
  query: ObservableQuery<folderOriginPrefix, folderOriginPrefixVariables>;
} {
  const data = ref<folderOriginPrefix | undefined>();
  const o = {
    query: require('./folderOriginPrefix.gql'),
  };
  const q = apolloClient.watchQuery<
    folderOriginPrefix,
    folderOriginPrefixVariables
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
  };
}
