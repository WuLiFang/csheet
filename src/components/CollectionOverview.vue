<template lang="pug">
  .collection-overview(
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
  )
    template(v-if="nodes.length === 0 ")
      .block(
        class="text-center h-32 font-bold pt-8 text-gray-600 col-span-6"
      ) 
        template(v-if="loadingCount > 0 ")
          FaIcon.h-32(name="spinner" spin)
        template(v-else)
          p 没有匹配的收藏，请检查选项后重试收集。
    template(v-for="i in nodes")
      CollectionOverviewCell(
        class="min-h-32"
        :id="i.id"
        :key="i.id"
        @click="showViewer(i)"
      )
    template(v-if="pageInfo.hasNextPage")
      button(
        class="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6"
        class="bg-gray-900 text-gray-600 h-32 min-h-full"
        title="加载更多"
        @click="fetchMore()"
        :disabled="loadingCount > 0"
      )
        template(v-if="loadingCount > 0 ")
          FaIcon.h-full(name="spinner" spin)
        template(v-else)
          span 加载更多
</template>

<script lang="ts">
import { filePathFormat } from '@/const';
import extractNodes from '@/utils/extractNodes';
import extractPageInfo from '@/utils/extractPageInfo';
import { ApolloQueryResult, ObservableQuery } from 'apollo-client';
import { DollarApollo } from 'vue-apollo/types/vue-apollo';
import 'vue-awesome/icons/spinner';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { OriginPrefix } from '../client';
import { db } from '../db';
import { Collection } from '../graphql/types/Collection';
import {
  collections,
  collectionsVariables,
  collections_collections as Collections
} from '../graphql/types/collections';
import {
  collectionUpdated,
  collectionUpdatedVariables
} from '../graphql/types/collectionUpdated';
import { presentationUpdatedVariables } from '../graphql/types/presentationUpdated';
import { show } from '../modal';
import { getCommonPrefix } from '../utils/getCommonPrefix';
import CollectionOverviewCell from './CollectionOverviewCell.vue';
import CollectionViewer from './CollectionViewer.vue';

@Component<CollectionOverview>({
  components: {
    CollectionOverviewCell,
  },
  apollo: {
    collections: {
      fetchPolicy: 'cache-and-network',
      query: require('@/graphql/queries/collections.gql'),
      skip(): boolean {
        return !this.variables.originPrefix;
      },
      variables(): collectionsVariables {
        return {
          ...this.variables,
          first: this.size,
          filePathFormat,
        };
      },
      result({ data }: ApolloQueryResult<collections>) {
        const commonPrefix = getCommonPrefix(
          data?.collections?.nodes
            ?.map(i => i?.origin)
            .filter((i): i is string => typeof i === 'string') || []
        );
        const prefix = OriginPrefix.parse(commonPrefix);
        if (prefix) {
          db.recentOriginPrefix.push(prefix);
        }
      },
      subscribeToMore: {
        document: require('@/graphql/subscriptions/collectionUpdated.gql'),
        variables(): collectionUpdatedVariables {
          return {
            originPrefix: this.variables.originPrefix,
            presentationCountGt: this.variables.presentationCountGt,
            filePathFormat,
          };
        },
        updateQuery(prev: collections, o) {
          const nodes = prev.collections.nodes ?? [];
          const {
            collectionUpdated,
          }: collectionUpdated = o.subscriptionData.data;

          if (nodes.some(i => i?.id === collectionUpdated.id)) {
            return;
          }
          let index = nodes.findIndex(
            i => i && collectionUpdated.origin < i.origin
          );

          if (index < 0) {
            if (prev.collections.pageInfo.hasNextPage) {
              return;
            }
            index = nodes.length;
          }
          nodes.splice(index, 0, collectionUpdated);
          return prev;
        },
      },
    },
    $subscribe: {
      presentaionUpdated: {
        query: require('@/graphql/subscriptions/presentationUpdated.gql'),
        variables(): presentationUpdatedVariables {
          return { id: this.presentationIDs, filePathFormat };
        },
        skip(): boolean {
          return this.presentationIDs.length === 0;
        },
      },
    },
  },
})
export default class CollectionOverview extends Vue {
  @Prop({ required: true })
  variables!: collectionsVariables;

  @Prop({ default: 50, type: Number })
  size!: number;

  collections?: Collections;
  $apollo!: DollarApollo<this> & {
    queries: {
      collections: ObservableQuery<collections, collectionsVariables>;
    };
  };

  loadingCount = 0;

  get nodes(): Collection[] {
    return extractNodes(this.collections);
  }

  get presentationIDs(): string[] {
    return this.nodes.flatMap(i => i.presentations.map(j => j.id));
  }

  get pageInfo(): Relay.PageInfo {
    return extractPageInfo(this.collections);
  }

  async fetchMore(): Promise<void> {
    if (!this.pageInfo.hasNextPage) {
      return;
    }
    await this.$apollo.queries.collections.fetchMore({
      variables: {
        before: undefined,
        last: undefined,
        originPrefix: undefined,
        ...this.variables,
        after: this.pageInfo.endCursor,
        first: this.size,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const ret = { ...previousResult };
        if (!fetchMoreResult) {
          return ret;
        }
        ret.collections.nodes = (ret.collections.nodes ?? [])
          .concat(fetchMoreResult.collections.nodes)
          .filter(i => !!i);
        ret.collections.pageInfo.hasNextPage =
          fetchMoreResult.collections.pageInfo.hasNextPage;
        ret.collections.pageInfo.endCursor =
          fetchMoreResult.collections.pageInfo.endCursor;

        return ret;
      },
    });
  }

  async showViewer(value: Collection): Promise<void> {
    const props: {
      value: Collection;
      prev?: Collection;
      next?: Collection;
    } = Vue.observable({
      value,
      prev: undefined,
      next: undefined,
    });
    const setValue = async (v: Collection) => {
      const index = this.nodes.findIndex(i => i.id === v.id);
      if (index === this.nodes.length - 1 && this.pageInfo.hasNextPage) {
        await this.fetchMore();
      }
      props.value = this.nodes[index];
      props.prev = index <= 0 ? undefined : this.nodes[index - 1];
      props.next =
        index >= this.nodes.length - 1 ? undefined : this.nodes[index + 1];
    };
    await setValue(value);
    show(CollectionViewer, {
      props,
      on: {
        'update:value': setValue,
      },
    });
  }

  async refetch(): Promise<void> {
    await this.$apollo.queries.collections.refetch();
  }
}
</script>
