import {
  cgteamworkProjects,
  cgteamworkProjectsVariables,
  cgteamworkProjects_cgteamworkProjects as Project,
} from '@/graphql/types/cgteamworkProjects';
import { OperationVariables } from 'apollo-client';
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';

export default function cgteamworkProjectsQuery<V>(
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
    update(data): Project[] {
      return data.cgteamworkProjects ?? [];
    },
  } as VueApolloQueryDefinition<cgteamworkProjects, OperationVariables>;
}
