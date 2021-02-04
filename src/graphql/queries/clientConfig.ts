// Code Generated from [base.ts.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  clientConfig,
  clientConfigVariables,
} from '@/graphql/types/clientConfig';
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

export { clientConfigVariables, clientConfig };

export async function query(
  variables: clientConfigVariables,
  options?: Omit<QueryOptions<clientConfigVariables>, 'query' | 'variables'>
): Promise<ApolloQueryResult<clientConfig>> {
  return await apolloClient.query<clientConfig, clientConfigVariables>({
    ...options,
    query: require('./clientConfig.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<clientConfig, clientConfigVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<clientConfig, OperationVariables> & ThisType<V> {
  return {
    ...o,
    query: require('./clientConfig.gql'),
  } as VueApolloQueryDefinition<clientConfig, OperationVariables>;
}

export function useQuery(
  variables: Ref<clientConfigVariables>,
  options?: Ref<
    Omit<WatchQueryOptions<clientConfigVariables>, 'query' | 'variables'>
  >
): {
  data: Ref<clientConfig | undefined>;
  query: ObservableQuery<clientConfig, clientConfigVariables>;
} {
  const data = ref<clientConfig | undefined>();
  const o = {
    query: require('./clientConfig.gql'),
  };
  const q = apolloClient.watchQuery<clientConfig, clientConfigVariables>({
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
  };
}
