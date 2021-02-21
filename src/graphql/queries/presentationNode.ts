// Code Generated from [base.ts.gotmpl node.gotmpl], DO NOT EDIT.
/* eslint-disable import/no-duplicates */
import {
  presentationNode,
  presentationNodeVariables,
} from '@/graphql/types/presentationNode';
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
import { computed } from '@vue/composition-api';

export { presentationNodeVariables, presentationNode };
export type Presentation = presentationNode['node'] & {
  __typename: 'Presentation';
};

function castNode(
  node: presentationNode['node'] | null | undefined
): Presentation | undefined {
  return node?.__typename === 'Presentation' ? node : undefined;
}

export async function query(
  variables: presentationNodeVariables,
  options?: Omit<QueryOptions<presentationNodeVariables>, 'query' | 'variables'>
): Promise<ApolloQueryResult<presentationNode>> {
  return await apolloClient.query<presentationNode, presentationNodeVariables>({
    ...options,
    query: require('./presentationNode.gql'),
    variables,
  });
}

export function vueQuery<V>(
  o: Omit<
    VueApolloQueryDefinition<presentationNode, presentationNodeVariables>,
    'query' | 'update'
  > &
    ThisType<V>
): VueApolloQueryDefinition<presentationNode, OperationVariables> &
  ThisType<V> {
  return {
    ...o,
    query: require('./presentationNode.gql'),
    update(data): Presentation | undefined {
      return castNode(data.node);
    },
  } as VueApolloQueryDefinition<presentationNode, OperationVariables>;
}

export function useQuery(
  variables: Ref<presentationNodeVariables>,
  options?: Ref<
    Omit<
      WatchQueryOptions<presentationNodeVariables>,
      'query' | 'variables'
    > & { skip?: boolean; loadingCount?: Ref<number> }
  >
): {
  data: Ref<presentationNode | undefined>;
  query: Ref<
    ObservableQuery<presentationNode, presentationNodeVariables> | undefined
  >;
  version: Ref<number>;
  node: Ref<Presentation | undefined>;
} {
  const data = ref<presentationNode | undefined>();
  const o = {
    query: require('./presentationNode.gql'),
  };
  const version = ref(0);

  const query = ref<
    ObservableQuery<presentationNode, presentationNodeVariables> | undefined
  >();
  const cleanup: (() => void)[] = [];
  const start = () => {
    if (query.value) {
      return;
    }
    query.value = apolloClient.watchQuery<
      presentationNode,
      presentationNodeVariables
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
      query.value?.setVariables(n);
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
    node: computed(() => castNode(data.value?.node)),
  };
}

export async function findById(id: string): Promise<Presentation | undefined> {
  if (!id) {
    return;
  }
  return castNode((await query({ id })).data.node);
}
