// Code Generated from [base.ts.gotmpl array.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  cgteamworkProjects,
  cgteamworkProjectsVariables,
} from '@/graphql/types/cgteamworkProjects';
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

export { cgteamworkProjectsVariables, cgteamworkProjects };
export type CGTeamworkProject = NonNullable<
  cgteamworkProjects['cgteamworkProjects']
>[0];

export async function query(
  variables: cgteamworkProjectsVariables,
  options?: Omit<
    QueryOptions<cgteamworkProjectsVariables>,
    'query' | 'variables'
  >
): Promise<ApolloQueryResult<cgteamworkProjects>> {
  return await apolloClient.query<
    cgteamworkProjects,
    cgteamworkProjectsVariables
  >({
    ...options,
    query: require('./cgteamworkProjects.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<cgteamworkProjects, cgteamworkProjectsVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<cgteamworkProjects, OperationVariables> &
  ThisType<V> {
  return {
    ...o,
    query: require('./cgteamworkProjects.gql'),
    update(data): CGTeamworkProject[] {
      return data.cgteamworkProjects ?? [];
    },
  } as VueApolloQueryDefinition<cgteamworkProjects, OperationVariables>;
}

export function useQuery(
  variables: Ref<cgteamworkProjectsVariables>,
  options?: Ref<
    Omit<
      WatchQueryOptions<cgteamworkProjectsVariables>,
      'query' | 'variables'
    > & { skip?: boolean; loadingCount?: Ref<number> }
  >
): {
  data: Ref<cgteamworkProjects | undefined>;
  query: Ref<
    ObservableQuery<cgteamworkProjects, cgteamworkProjectsVariables> | undefined
  >;
  version: Ref<number>;
} {
  const data = ref<cgteamworkProjects | undefined>();
  const o = {
    query: require('./cgteamworkProjects.gql'),
  };
  const version = ref(0);

  const query = ref<
    ObservableQuery<cgteamworkProjects, cgteamworkProjectsVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    query.value = apolloClient.watchQuery<
      cgteamworkProjects,
      cgteamworkProjectsVariables
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
      version.value += 1;
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
      query.value?.refetch(n);
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
    version,
  };
}

export async function find(
  variables: cgteamworkProjectsVariables
): Promise<CGTeamworkProject[]> {
  const { data } = await apolloClient.query<
    cgteamworkProjects,
    cgteamworkProjectsVariables
  >({
    query: require('./cgteamworkProjects.gql'),
    variables,
  });

  return data.cgteamworkProjects ?? [];
}
