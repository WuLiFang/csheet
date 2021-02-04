// Code Generated from [base.ts.gotmpl array.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import { cgteamworkStatuses } from '@/graphql/types/cgteamworkStatuses';
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
type cgteamworkStatusesVariables = never;

export { cgteamworkStatusesVariables, cgteamworkStatuses };
export type CGTeamworkStatus = NonNullable<
  cgteamworkStatuses['cgteamworkStatuses']
>[0];

export async function query(
  options?: Omit<
    QueryOptions<cgteamworkStatusesVariables>,
    'query' | 'variables'
  >
): Promise<ApolloQueryResult<cgteamworkStatuses>> {
  return await apolloClient.query<
    cgteamworkStatuses,
    cgteamworkStatusesVariables
  >({
    ...options,
    query: require('./cgteamworkStatuses.gql'),
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<cgteamworkStatuses, cgteamworkStatusesVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<cgteamworkStatuses, OperationVariables> &
  ThisType<V> {
  return {
    ...o,
    query: require('./cgteamworkStatuses.gql'),
    update(data): CGTeamworkStatus[] {
      return data.cgteamworkStatuses ?? [];
    },
  } as VueApolloQueryDefinition<cgteamworkStatuses, OperationVariables>;
}

export function useQuery(
  options?: Ref<
    Omit<WatchQueryOptions<cgteamworkStatusesVariables>, 'query' | 'variables'>
  >
): {
  data: Ref<cgteamworkStatuses | undefined>;
  query: ObservableQuery<cgteamworkStatuses, cgteamworkStatusesVariables>;
} {
  const data = ref<cgteamworkStatuses | undefined>();
  const o = {
    query: require('./cgteamworkStatuses.gql'),
  };
  const q = apolloClient.watchQuery<
    cgteamworkStatuses,
    cgteamworkStatusesVariables
  >({
    ...options?.value,
    ...o,
  });
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

export async function find(): Promise<CGTeamworkStatus[]> {
  const { data } = await apolloClient.query<
    cgteamworkStatuses,
    cgteamworkStatusesVariables
  >({
    query: require('./cgteamworkStatuses.gql'),
  });

  return data.cgteamworkStatuses ?? [];
}
