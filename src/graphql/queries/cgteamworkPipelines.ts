// Code Generated from [base.ts.gotmpl array.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  cgteamworkPipelines,
  cgteamworkPipelinesVariables,
} from '@/graphql/types/cgteamworkPipelines';
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

export { cgteamworkPipelinesVariables, cgteamworkPipelines };
export type CGTeamworkPipeline = NonNullable<
  cgteamworkPipelines['cgteamworkPipelines']
>[0];

export async function query(
  variables: cgteamworkPipelinesVariables,
  options?: Omit<
    QueryOptions<cgteamworkPipelinesVariables>,
    'query' | 'variables'
  >
): Promise<ApolloQueryResult<cgteamworkPipelines>> {
  return await apolloClient.query<
    cgteamworkPipelines,
    cgteamworkPipelinesVariables
  >({
    ...options,
    query: require('./cgteamworkPipelines.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<cgteamworkPipelines, cgteamworkPipelinesVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<cgteamworkPipelines, OperationVariables> &
  ThisType<V> {
  return {
    ...o,
    query: require('./cgteamworkPipelines.gql'),
    update(data): CGTeamworkPipeline[] {
      return data.cgteamworkPipelines ?? [];
    },
  } as VueApolloQueryDefinition<cgteamworkPipelines, OperationVariables>;
}

export function useQuery(
  variables: Ref<cgteamworkPipelinesVariables>,
  options?: Ref<
    Omit<WatchQueryOptions<cgteamworkPipelinesVariables>, 'query' | 'variables'>
  >
): {
  data: Ref<cgteamworkPipelines | undefined>;
  query: ObservableQuery<cgteamworkPipelines, cgteamworkPipelinesVariables>;
} {
  const data = ref<cgteamworkPipelines | undefined>();
  const o = {
    query: require('./cgteamworkPipelines.gql'),
  };
  const q = apolloClient.watchQuery<
    cgteamworkPipelines,
    cgteamworkPipelinesVariables
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
  onDeactivated(() => {
    sub.unsubscribe();
  });
  const query = q;
  return {
    data,
    query,
  };
}

export async function find(
  variables: cgteamworkPipelinesVariables
): Promise<CGTeamworkPipeline[]> {
  const { data } = await apolloClient.query<
    cgteamworkPipelines,
    cgteamworkPipelinesVariables
  >({
    query: require('./cgteamworkPipelines.gql'),
    variables,
  });

  return data.cgteamworkPipelines ?? [];
}
