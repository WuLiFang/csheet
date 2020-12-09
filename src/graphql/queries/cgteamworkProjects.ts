// Code Generated from [base.ts.gotmpl array.gotmpl], DO NOT EDIT.
import {
  cgteamworkProjects,
  cgteamworkProjectsVariables,
} from '@/graphql/types/cgteamworkProjects';
import {
  OperationVariables,
  QueryOptions,
  ApolloQueryResult,
} from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';
import { apolloClient } from '@/client';

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
