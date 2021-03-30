<template>
  <transition
    appear="appear"
    enter-class="transform -translate-y-full"
    leave-to-class="transform -translate-y-full"
    enter-active-class="transition-all duration-300 ease-in-out"
    leave-active-class="transition-all duration-300 ease-in-out"
    @after-leave="$emit('close')"
  >
    <div
      v-if="visible"
      class="collection-viewer fixed inset-0 z-20 flex flex-col overflow-hidden bg-black lg:h-screen"
    >
      <header
        class="flex-initial bg-gray-800 pointer-events-auto p-1 overflow-hidden"
      >
        <div class="inline-block float-right h-16">
          <button
            ref="prev"
            class="h-full text-gray-400 hover:text-gray-200 disabled:text-gray-600 outline-none"
            :disabled="!prev"
            title="上一个（快捷键：↑）"
            @click="jumpPrev()"
            @animationend="$event.target.classList.remove('button-click-anim')"
          >
            <FaIcon class="h-full" name="caret-square-up"></FaIcon>
          </button>
          <button
            ref="next"
            class="h-full text-gray-400 ml-1 hover:text-gray-200 disabled:text-gray-600 outline-none"
            :disabled="!next"
            title="下一个（快捷键：↓）"
            @click="jumpNext()"
            @animationend="$event.target.classList.remove('button-click-anim')"
          >
            <FaIcon class="h-full" name="caret-square-down"></FaIcon>
          </button>
          <button
            class="h-full text-gray-400 ml-1 hover:text-gray-200 outline-none"
            title="关闭（快捷键：Esc）"
            @click="close()"
          >
            <FaIcon class="h-full" name="window-close"></FaIcon>
          </button>
        </div>
        <h1 class="text-2xl text-gray-400 break-all">{{ value.title }}</h1>
        <p class="text-sm text-gray-500 select-all break-all">
          {{ presentation && presentation.raw.path }}
        </p>
      </header>
      <main
        class="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden"
      >
        <PresentationViewer
          ref="presentationViewer"
          :value="presentation"
          class="flex-none relative text-center lg:w-2/3 lg:h-full flex flex-col"
        ></PresentationViewer>
        <aside
          class="flex-auto bg-gray-900 lg:flex-initial lg:w-1/3 lg:overflow-auto"
        >
          <PresentationSelect
            v-show="value.presentations.length > 0"
            v-model="presentationID"
            class="min-h-16 mb-2"
            :options="value.presentations"
          ></PresentationSelect>
          <CollectionMetadata class="flex-auto lg:mx-1" :value="value">
          </CollectionMetadata>
          <hr class="border-gray-700 my-2" />
          <PresentationMetadata
            v-if="presentation"
            class="flex-auto lg:mx-1"
            :value="presentation"
          ></PresentationMetadata>
          <hr class="border-gray-700 my-2" />
          <div class="block lg:mx-1">
            <span>查看器背景</span>
            <Radio
              v-model="viewerBackground"
              class="inline-block py-1 ml-1"
              :options="[
                { key: 'checkboard', value: 'checkboard', label: '棋盘格' },
                {
                  key: 'checkboard-sm',
                  value: 'checkboard-sm',
                  label: '棋盘格(小)',
                },
                { key: 'white', value: 'white', label: '纯白' },
                { key: 'black', value: 'black', label: '纯黑' },
              ]"
            ></Radio>
          </div>
        </aside>
      </main>
      <template v-for="i in prefetchURLs">
        <link :key="i" rel="prefetch" :href="i" />
      </template>
    </div>
  </transition>
</template>

<script lang="ts">
import PresentationViewer from '@/components/PresentationViewer.static.vue';
import { viewerBackground } from '@/preference';
import relativeURL from '@/utils/relativeURL';
import toHotKey from '@/utils/toHotKey';
import { sortBy, throttle, uniq } from 'lodash';
import 'vue-awesome/icons/backward';
import 'vue-awesome/icons/camera';
import 'vue-awesome/icons/caret-square-down';
import 'vue-awesome/icons/caret-square-up';
import 'vue-awesome/icons/fast-backward';
import 'vue-awesome/icons/fast-forward';
import 'vue-awesome/icons/forward';
import 'vue-awesome/icons/pause';
import 'vue-awesome/icons/play';
import 'vue-awesome/icons/step-backward';
import 'vue-awesome/icons/step-forward';
import 'vue-awesome/icons/window-close';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Collection } from '../graphql/types/Collection';
import { Presentation as PresentationData } from '../graphql/types/Presentation';
import CollectionMetadata from './CollectionMetadata.static.vue';
import Presentation from './Presentation.static.vue';
import PresentationMetadata from './PresentationMetadata.static.vue';
import PresentationSelect from './PresentationSelect.vue';

@Component<CollectionViewer>({
  components: {
    Presentation,
    PresentationSelect,
    CollectionMetadata,
    PresentationMetadata,
    PresentationViewer,
  },
  mounted() {
    const throttleJump = throttle((fn: () => void) => fn(), 800);
    const throttleSeek = throttle((fn: () => void) => fn(), 100);
    const keyupListener = (e: KeyboardEvent) => {
      const throttleRepeatJump = e.repeat
        ? throttleJump
        : (fn: () => void) => fn();
      const throttleRepeatSeek = e.repeat
        ? throttleSeek
        : (fn: () => void) => fn();
      if (
        !(
          e.target === document.body ||
          e.target instanceof HTMLButtonElement ||
          e.target === this.$refs.presentationViewer?.$el ||
          e.target === this.$refs.prev ||
          e.target === this.$refs.next ||
          e.target === this.$refs.presentationViewer?.annotation?.$el
        )
      ) {
        return;
      }
      switch (toHotKey(e)) {
        case 'Escape':
          e.preventDefault();
          this.close();
          break;
        case ' ':
          e.preventDefault();
          if (this.$refs.presentationViewer?.presentation?.paused) {
            this.$refs.presentationViewer?.presentation?.play();
          } else {
            this.$refs.presentationViewer?.presentation?.pause();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          throttleRepeatJump(() => {
            this.jumpPrev();
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          throttleRepeatJump(() => {
            this.jumpNext();
          });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          throttleRepeatSeek(() => {
            this.$refs.presentationViewer?.presentation?.seekFrameOffset(
              -1,
              true
            );
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          throttleRepeatSeek(() => {
            this.$refs.presentationViewer?.presentation?.seekFrameOffset(
              1,
              true
            );
          });
          break;
        case '+ArrowLeft':
          e.preventDefault();
          throttleRepeatSeek(() => {
            this.$refs.presentationViewer?.controls?.skipFrameBackward();
          });
          break;
        case '+ArrowRight':
          e.preventDefault();
          throttleRepeatSeek(() => {
            this.$refs.presentationViewer?.controls?.skipFrameForward();
          });
          break;
        case 'Home':
          e.preventDefault();
          this.$refs.presentationViewer?.presentation?.seekFrame(
            this.$refs.presentationViewer?.presentation?.firstFrame,
            true
          );
          break;
        case 'End':
          e.preventDefault();
          this.$refs.presentationViewer?.presentation?.seekFrame(
            this.$refs.presentationViewer?.presentation?.lastFrame,
            true
          );
          break;
        case 'g': {
          e.preventDefault();
          this.$refs.presentationViewer?.controls?.$refs.timeInput?.$el.select();
          break;
        }
        case 'f': {
          e.preventDefault();
          this.$refs.presentationViewer?.controls?.$refs.frameInput?.$el.select();
          break;
        }
        case 'j': {
          e.preventDefault();
          this.$refs.presentationViewer?.controls?.offsetPlaybackRateIndex(-1);
          break;
        }
        case 'k': {
          e.preventDefault();
          this.$refs.presentationViewer?.controls?.setPlaybackRate(1);
          break;
        }
        case 'l': {
          e.preventDefault();
          this.$refs.presentationViewer?.controls?.offsetPlaybackRateIndex(1);
          break;
        }
      }
    };
    document.body.addEventListener('keydown', keyupListener, { capture: true });
    this.$once('destroyed', () => {
      document.body.removeEventListener('keydown', keyupListener, {
        capture: true,
      });
    });

    const screenshotListener = async (cb: (v: Blob) => void) => {
      const data = await this.$refs.presentationViewer?.screenshot();
      if (data) {
        cb(data);
      }
    };

    this.$root.$on('viewer-screenshot', screenshotListener);
    this.$once('destroyed', () => {
      this.$root.$off('viewer-screenshot', screenshotListener);
    });
  },
  destroyed() {
    this.$emit('destroyed');
  },
  setup() {
    return {
      viewerBackground,
    };
  },
})
export default class CollectionViewer extends Vue {
  @Prop({ type: Object, required: true })
  value!: Collection;

  @Prop({ type: Object })
  prev?: Collection;

  @Prop({ type: Object })
  next?: Collection;

  $refs!: {
    prev: HTMLButtonElement;
    next: HTMLButtonElement;
    presentationViewer: InstanceType<typeof PresentationViewer>;
  };

  visible = true;
  presentationID = '';
  loadingCount = 0;
  recollectingCount = 0;

  jumpPrev(): void {
    if (this.prev) {
      this.$refs.prev.classList.add('button-click-anim');
      this.$emit('update:value', this.prev);
    }
  }

  jumpNext(): void {
    if (this.next) {
      this.$refs.next.classList.add('button-click-anim');
      this.$emit('update:value', this.next);
    }
  }

  close(): void {
    this.visible = false;
  }

  get prefetchURLs(): string[] {
    const ret: string[] = [];
    for (const i of [this.next, this.value, this.prev]) {
      if (!i) {
        continue;
      }
      sortBy(i.presentations, [(i) => -new Date(i.raw.modTime ?? 0).getTime()])
        .slice(0, 5)
        .forEach((j) => {
          ret.push(
            relativeURL(
              j.regular?.url || require('@/assets/img/transcoding.svg')
            )
          );
        });
    }
    return uniq(ret);
  }

  get presentation(): PresentationData | undefined {
    return this.value.presentations.find((i) => i.id === this.presentationID);
  }

  async refetch(): Promise<void> {
    await this.$apollo.queries.node.refetch();
  }

  get width(): number {
    const v = parseFloat(
      this.presentation?.metadata.find((i) => i.k === 'width')?.v ?? ''
    );
    if (!isFinite(v)) {
      return 1920;
    }
    return v;
  }

  get height(): number {
    const v = parseFloat(
      this.presentation?.metadata.find((i) => i.k === 'height')?.v ?? ''
    );
    if (!isFinite(v)) {
      return 1080;
    }
    return v;
  }
}
</script>

<style lang="scss" scoped>
.button-click-anim {
  animation: button-click 500ms ease-in-out;
}

@keyframes button-click {
  30% {
    @apply opacity-25;
  }
}
</style>
