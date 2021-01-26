<template lang="pug">
  #app(
    class="bg-black text-gray-200 h-screen overflow-x-hidden overflow-y-auto relative"
    @scroll.passive="handleScroll"
  )
    header.pt-1(
      class="bg-gray-800 text-right text-gray-400 text-sm"
    )
      span.mx-1.text-gray-600 {{ RELEASE }}
      span.mx-1.text-gray-600 &copy; 2018-2021 北京吾立方数码科技有限公司
      a.mx-1(
        v-if="config && config.issueTrackerURL"
        :href="config.issueTrackerURL"
        target="__blank"
      ) 问题反馈
    TheNavbar(
      class="sticky top-0 bg-gray-800 p-2 w-full text-center z-20 transition duration-500 ease-in-out"
      :class="{'transform -translate-y-full': collapseNav }"
      @update:variables="variables = $event"
    )
    main
      CollectionOverview(
        ref="overview"
        class="w-full z-0"
        :variables="variables"
      )
    ModalWrapper(
      class="modals z-10"
      ref="modalWrapper"
    )
    MessageList(
      class="messages z-20"
    )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TheNavbar from './components/TheNavbar.vue';
import CollectionOverview from './components/CollectionOverview.vue';
import db from '@/db';
import {
  clientConfig,
  clientConfig_clientConfig as Config,
  clientConfigVariables,
} from './graphql/types/clientConfig';
import { ModalWrapper } from '@/modal';
import { MessageList } from '@/message';
import { filePathFormat } from '@/const';

@Component<App>({
  components: {
    TheNavbar,
    CollectionOverview,
    ModalWrapper,
    MessageList,
  },
  apollo: {
    config: {
      query: require('@/graphql/queries/clientConfig.gql'),
      update(v: clientConfig): Config | undefined {
        return v.clientConfig ?? undefined;
      },
      variables(): clientConfigVariables {
        return { filePathFormat };
      },
    },
  },
  mounted() {
    db.preference.load();
  },
})
export default class App extends Vue {
  config?: Config;

  variables: CollectionOverview['variables'] = {
    originPrefix: '',
  };

  $refs!: {
    overview: CollectionOverview;
    modalWrapper: Vue;
  };

  collapseNav = false;
  lastScrollTop = 0;
  RELEASE = RELEASE;

  handleScroll(e: Event): void {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }
    const el = e.target;
    if (el.scrollTop + el.clientHeight === el.scrollHeight) {
      this.$refs.overview?.fetchMore();
    }
    this.collapseNav = el.scrollTop > this.lastScrollTop;

    this.lastScrollTop = el.scrollTop;
  }
}
</script>
