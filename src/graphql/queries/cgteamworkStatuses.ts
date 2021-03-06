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
import { ref, Ref, watch } from '@vue/composition-api';
import useCleanup from '@/composables/useCleanup';
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
  version: Ref<number>;
} {
  const data = ref<cgteamworkStatuses | undefined>();
  const o = {
    query: require('./cgteamworkStatuses.gql'),
  };
  const version = ref(0);

  const query = ref<
    ObservableQuery<cgteamworkStatuses, cgteamworkStatusesVariables> | undefined
  >();
  const { cleanup, addCleanup } = useCleanup();
  const start = () => {
    if (query.value) {
      return;
    }
    const q = apolloClient.watchQuery<
      cgteamworkStatuses,
      cgteamworkStatusesVariables
    >({
      ...options?.value,
      ...o,
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
    addCleanup(() => {
      sub.unsubscribe();
    });
  };
  const stop = () => {
    cleanup();
    query.value = undefined;
  };

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

export async function find(): Promise<CGTeamworkStatus[]> {
  const { data } = await apolloClient.query<
    cgteamworkStatuses,
    cgteamworkStatusesVariables
  >({
    query: require('./cgteamworkStatuses.gql'),
  });

  return data.cgteamworkStatuses ?? [];
}
