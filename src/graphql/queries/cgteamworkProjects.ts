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
    Omit<WatchQueryOptions<cgteamworkProjectsVariables>, 'query' | 'variables'>
  >
): {
  data: Ref<cgteamworkProjects | undefined>;
  query: ObservableQuery<cgteamworkProjects, cgteamworkProjectsVariables>;
} {
  const data = ref<cgteamworkProjects | undefined>();
  const o = {
    query: require('./cgteamworkProjects.gql'),
  };
  const q = apolloClient.watchQuery<
    cgteamworkProjects,
    cgteamworkProjectsVariables
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
