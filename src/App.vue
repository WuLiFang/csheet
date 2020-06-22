<template lang="pug">
  #app(
    class="bg-black text-gray-200 h-screen overflow-x-hidden overflow-y-auto relative"
    @scroll.passive="handleScroll"
  )
    header(
      class="bg-gray-800 text-right"
    )
      span.m-1.text-gray-600 {{ RELEASE }}
    TheNavbar(
      class="sticky top-0 bg-gray-800 p-2 w-full text-center z-20 transition duration-500 ease-in-out"
      :style="{ 'transform': collapseNav ? 'translateY(-100%)' : null }"
      :variables.sync="variables"
      @collect="() => $refs.overview.refetch()"
    )
    transition-group.messages(
      tag="ul"
      name="message"
      mode="out-in"
      class="fixed bottom-0 right-0 z-30 flex flex-col-reverse items-end"
    )
      li(
        v-for="i in messages"
        class="p-3 rounded mx-2 my-1 bg-gray-400 text-black break-all"
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
import * as preference from '@/preference';

@Component<App>({
  components: {
    TheNavbar,
    CollectionOverview,
  },
  mounted() {
    preference.load();
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
      }, 3e3 + 0.1e3 * msg.text.length);
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

  handleScroll(e: Event):void {
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
<style lang="scss" scoped>
.message-enter,
.message-leave-to {
  @apply opacity-0;
  transform: translateX(100%);
}

.message-leave-active,
.message-enter-active,
.message-move {
  @apply transition-all;
  @apply ease-in-out;
  @apply duration-500;
}
</style>
