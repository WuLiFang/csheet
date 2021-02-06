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
    Omit<
      WatchQueryOptions<cgteamworkStatusesVariables>,
      'query' | 'variables'
    > & { skip?: boolean; loadingCount?: Ref<number> }
  >
): {
  data: Ref<cgteamworkStatuses | undefined>;
  query: Ref<
    ObservableQuery<cgteamworkStatuses, cgteamworkStatusesVariables> | undefined
  >;
} {
  const data = ref<cgteamworkStatuses | undefined>();
  const o = {
    query: require('./cgteamworkStatuses.gql'),
  };

  const query = ref<
    ObservableQuery<cgteamworkStatuses, cgteamworkStatusesVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    query.value = apolloClient.watchQuery<
      cgteamworkStatuses,
      cgteamworkStatusesVariables
    >({
      ...options?.value,
      ...o,
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
