<template lang="pug">
  #app(
    class="bg-black text-gray-200 h-screen overflow-x-hidden overflow-y-auto relative"
    @scroll.passive="handleScroll"
  )
    header.pt-1(
      class="bg-gray-800 text-right text-gray-400 text-sm"
    )
      span.mx-1.text-gray-600 {{ RELEASE }}
      span.mx-1.text-gray-600 &copy; 2018-2020 北京吾立方数码科技有限公司 
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
    transition-group.messages(
      tag="ul"
      class="fixed bottom-0 right-0 z-30 flex flex-col-reverse items-end"
      move-class="transition ease-in-out duration-200"
      enter-active-class="transition ease-in-out duration-300"
      enter-class="opacity-0 transform translate-x-full"
      leave-active-class="transition ease-in-out duration-1000"
      leave-to-class="opacity-0"
    )
      li(
        v-for="i in messages"
        class="p-3 roundeds-sm w-64 mx-2 my-1 bg-gray-900 text-white break-all"
        :key="i.key"
        :class="i.class"
      ) {{ i.text }}
    CollectionOverview(
      ref="overview"
      class="w-full z-0"
      :variables="variables"
    )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TheNavbar from './components/TheNavbar.vue';
import CollectionOverview from './components/CollectionOverview.vue';
import * as cast from 'cast-unknown';
import db from '@/db';
import {
  clientConfig,
  clientConfig_clientConfig as Config,
} from './graphql/types/clientConfig';

@Component<App>({
  components: {
    TheNavbar,
    CollectionOverview,
  },
  apollo: {
    config: {
      query: require('@/graphql/queries/clientConfig.gql'),
      update(v: clientConfig): Config | undefined {
        return v.clientConfig ?? undefined;
      },
    },
  },
  mounted() {
    db.preference.load();
    const listener = (v: unknown) => {
      const msg: App['messages'][0] = {
        text: '',
        key: new Date().getTime().toString(),
      };
      if (typeof v === 'string') {
        msg.text = v;
      } else {
        const o = cast.object(v);
        msg.class = cast.string(o.class);
        msg.text = cast.string(o.text);
      }
      this.messages.splice(0, 0, msg);
      setTimeout(() => {
        this.messages.splice(this.messages.indexOf(msg), 1);
      }, 3e3 + 0.2e3 * msg.text.length);
    };
    this.$root.$on('app-message', listener);
    this.$once('destroyed', () => {
      this.$root.$off('app-message', listener);
    });
  },
  destroyed() {
    this.$emit('destroyed');
  },
})
export default class App extends Vue {
  config?: Config;

  variables: CollectionOverview['variables'] = {
    originPrefix: '',
  };

  $refs!: {
    overview: CollectionOverview;
  };

  messages: {
    key: string;
    class?: string;
    text: string;
  }[] = [];

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
