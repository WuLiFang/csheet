<template>
  <div
    class="collection-overview grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
  >
    <template v-if="collections.length === 0">
      <div
        class="block text-center h-32 font-bold pt-8 text-gray-600 col-span-6"
      >
        <template>
          <p>没有匹配的收藏。</p>
        </template>
      </div>
    </template>
    <template v-for="i in visbileCollections">
      <CollectionOverviewCell
        :key="i.id"
        :value="i"
        class="min-h-32"
        @click="showViewer(i)"
      ></CollectionOverviewCell>
    </template>
    <template v-if="hasNextPage">
      <p
        class="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6 bg-gray-900 text-gray-500 h-32 text-xl flex flex-center"
      >
        归档时匹配的收藏超过了服务器限制，本页面仅包含前
        {{ collections.length }} 个收藏
      </p>
    </template>
  </div>
</template>

<script lang="ts">
import filterCollections from '@/client/utils/filterCollections';
import CollectionViewer from '@/components/CollectionViewer.static.vue';
import { collectionsVariables } from '@/graphql/types/collections';
import { show } from '@/modal';
import {
  computed,
  defineComponent,
  PropType,
  reactive,
} from '@vue/composition-api';
import 'vue-awesome/icons/spinner';
import { Collection } from '../graphql/types/Collection';
import CollectionOverviewCell from './CollectionOverviewCell.static.vue';

export default defineComponent({
  name: 'CollectionOverview',
  props: {
    collections: {
      type: Array as PropType<Collection[]>,
      required: true,
    },
    hasNextPage: {
      type: Boolean,
      default: false,
    },
    variables: {
      type: Object as PropType<collectionsVariables>,
      default: () => ({}),
    },
  },
  components: {
    CollectionOverviewCell,
  },
  setup: (props) => {
    const visbileCollections = computed(() =>
      filterCollections(props.collections, props.variables)
    );
    const showViewer = async (value: Collection): Promise<void> => {
      const viewerProps: {
        value: Collection;
        prev?: Collection;
        next?: Collection;
      } = reactive({
        value,
        prev: undefined,
        next: undefined,
      });
      const setValue = async (v: Collection) => {
        const index = visbileCollections.value.findIndex((i) => i.id === v.id);
        viewerProps.value = visbileCollections.value[index];
        viewerProps.prev =
          index <= 0 ? undefined : visbileCollections.value[index - 1];
        viewerProps.next =
          index >= visbileCollections.value.length - 1
            ? undefined
            : visbileCollections.value[index + 1];
      };
      await setValue(value);
      show(CollectionViewer, {
        props: viewerProps,
        on: {
          'update:value': setValue,
        },
      });
    };
    return {
      showViewer,
      visbileCollections,
    };
  },
});
</script>
