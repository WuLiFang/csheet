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
        :value="i"
        :key="i.id"
        @click="showViewer(i)"
      )
    template(v-if="pageInfo.hasNextPage")
      button(
        class="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6"
        class="bg-gray-900 text-gray-600 h-32 min-h-full"
        @click="fetchMore()"
        :disabled="loadingCount > 0"
      )
        template(v-if="loadingCount > 0 ")
          FaIcon.h-full(name="spinner" spin)
        template(v-else)
          span 加载更多
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { collection as Collection } from '../graphql/types/collection';
import { pageInfo as PageInfo } from '../graphql/types/pageInfo';

import {
  collectionsVariables,
  collections,
  collections_collections as Collections,
} from '../graphql/types/collections';
import { extractNodes, extractPageInfo } from '../client/relay';
import CollectionOverviewCell from './CollectionOverviewCell.vue';
import { show } from '../modal';
import CollectionViewer from './CollectionViewer.vue';
import { ObservableQuery } from 'apollo-client';
import { DollarApollo } from 'vue-apollo/types/vue-apollo';
import 'vue-awesome/icons/spinner';
import { presentationUpdatedVariables } from '../graphql/types/presentationUpdated';
import { filePathFormat } from '@/const';
@Component<CollectionOverview>({
  components: {
    CollectionOverviewCell,
  },
  apollo: {
    collections() {
      return {
        fetchPolicy: 'cache-and-network',
        query: require('@/graphql/queries/collections.gql'),
        skip: (): boolean => {
          return !this.variables.originPrefix;
        },
        variables: (): collectionsVariables => {
          return {
            ...this.variables,
            first: this.size,
            filePathFormat,
          };
        },
        subscribeToMore: [
          {
            document: require('@/graphql/subscriptions/presentationUpdated.gql'),
            variables: (): presentationUpdatedVariables => {
              const id = this.nodes.flatMap(i =>
                i.presentations.map(j => j.id)
              );
              return { id, filePathFormat };
            },
          },
        ],
      };
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

  get nodes() {
    return extractNodes(this.collections);
  }

  get pageInfo() {
    return extractPageInfo(this.collections);
  }

  async fetchMore() {
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
        ret.collections.nodes = (ret.collections.nodes ?? []).concat(
          fetchMoreResult.collections.nodes
        );
        ret.collections.pageInfo.hasNextPage =
          fetchMoreResult.collections.pageInfo.hasNextPage;
        ret.collections.pageInfo.endCursor =
          fetchMoreResult.collections.pageInfo.endCursor;

        return ret;
      },
    });
  }

  async showViewer(value: Collection) {
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
      let index = this.nodes.findIndex(i => i.id === v.id);
      if (index == this.nodes.length - 1 && this.pageInfo.hasNextPage) {
        await this.fetchMore();
      }
      props.value = this.nodes[index];
      props.prev = index <= 0 ? undefined : this.nodes[index - 1];
      props.next =
        index >= this.nodes.length - 1 ? undefined : this.nodes[index + 1];
    };
    await setValue(value);
    const vm = show(CollectionViewer, {
      props,
      on: {
        'update:value': setValue,
      },
    });
  }
  async refetch() {
    await this.$apollo.queries.collections.refetch();
  }
}
</script>
