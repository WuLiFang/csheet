<template>
  <div
    id="app"
    class="bg-black text-gray-200 h-screen overflow-x-hidden overflow-y-auto relative"
    @scroll.passive="_handleScroll"
  >
    <header class="pt-1 bg-gray-800 text-right text-gray-400 text-sm">
      <span class="mx-1 text-gray-600">{{ RELEASE }}</span
      ><span class="mx-1 text-gray-600"
        >&copy; 2018-2021 北京吾立方数码科技有限公司</span
      ><a
        v-if="config.issueTrackerURL"
        class="mx-1"
        :href="config.issueTrackerURL"
        target="__blank"
        >问题反馈</a
      >
    </header>
    <TheNavbar
      class="sticky top-0 bg-gray-800 p-2 w-full text-center z-20 transition duration-500 ease-in-out"
      :class="{ 'transform -translate-y-full': isCollapseNav }"
      @update:variables="variables = $event"
    ></TheNavbar>
    <main>
      <CollectionOverview
        class="w-full z-0"
        :collections="collections"
        :variables="variables"
        :has-next-page="hasNextPage"
      ></CollectionOverview>
    </main>
    <ModalWrapper class="modals z-10"></ModalWrapper>
    <MessageList class="messages z-20"></MessageList>
  </div>
</template>

<script lang="ts">
import { MessageList } from '@/message';
import { ModalWrapper } from '@/modal';
import { PAGE_DATA } from '@/page-data.static';
import { computed, defineComponent, ref } from '@vue/composition-api';
import CollectionOverview from './components/CollectionOverview.static.vue';
import TheNavbar from './components/TheNavbar.static.vue';
import { collectionsVariables } from '@/graphql/types/collections';
import extractNodes from '@/utils/extractNodes';

export default defineComponent({
  name: 'App',
  props: {},
  components: {
    TheNavbar,
    CollectionOverview,
    ModalWrapper,
    MessageList,
  },
  setup: () => {
    const config = computed(() => PAGE_DATA.value.clientConfig);
    const collections = computed(() => extractNodes(PAGE_DATA.value.collections));
    const hasNextPage = computed(() => PAGE_DATA.value.collections.pageInfo.hasNextPage)
    const isCollapseNav = ref(false);
    const lastScrollTop = ref(0);
    const variables = ref<collectionsVariables>();
    return {
      config,
      collections,
      isCollapseNav,
      lastScrollTop,
      variables,
      hasNextPage,
      RELEASE: RELEASE, // value from define plugin
    };
  },
  methods: {
    _handleScroll(e: Event): void {
      if (!(e.target instanceof HTMLElement)) {
        return;
      }
      const el = e.target;
      this.collapseNav = el.scrollTop > this.lastScrollTop;

      this.lastScrollTop = el.scrollTop;
    },
  },
});
</script>
