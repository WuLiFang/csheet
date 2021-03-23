<template lang="pug">
  transition(
    appear
    enter-class="transform -translate-y-full"
    leave-to-class="transform -translate-y-full"
    enter-active-class="transition-all duration-300 ease-in-out"
    leave-active-class="transition-all duration-300 ease-in-out"
    @after-leave="$emit('close')"
  )
    .collection-viewer(
      class="fixed inset-0 z-20 flex flex-col overflow-hidden bg-black lg:h-screen"
      v-if="visible"
    )
      header(
        class="flex-initial bg-gray-800 pointer-events-auto p-1 overflow-hidden"
      )
        .inline-block(
          class="float-right h-16"
        )
          button(
            ref="prev"
            class="h-full text-gray-400 hover:text-gray-200 disabled:text-gray-600"
            class="outline-none"
            :disabled="!prev"
            @click="jumpPrev()"
            @animationend="$event.target.classList.remove('button-click-anim')"
            title="上一个（快捷键：↑）"
          )
            FaIcon.h-full(name="caret-square-up")
          button(
            ref="next"
            class="h-full text-gray-400 ml-1 hover:text-gray-200 disabled:text-gray-600"
            class="outline-none"
            :disabled="!next"
            title="下一个（快捷键：↓）"
            @click="jumpNext()"
            @animationend="$event.target.classList.remove('button-click-anim')"
          )
            FaIcon.h-full(name="caret-square-down")
          button(
            class="h-full text-gray-400  ml-1 hover:text-gray-200 outline-none"
            title="关闭（快捷键：Esc）"
            @click="close()"
          )
            FaIcon.h-full(name="window-close")
        h1(
          class="text-2xl text-gray-400 break-all"
        ) {{value.title}}
        p(
          class="text-sm text-gray-500 select-all break-all"
        ) {{presentation && presentation.raw.path}}
      main(
        class="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden"
      )
        PresentationViewer(
          :id="presentationID"
          ref="presentationViewer"
          class="flex-none relative text-center lg:w-2/3 lg:h-full flex flex-col"
        )
        aside(
          class="flex-auto bg-gray-900 lg:flex-initial lg:w-1/3 lg:overflow-auto"
        )
          PresentationSelect(
            v-show="value.presentations.length > 0"
            v-model="presentationID"
            :options="value.presentations"
            class="min-h-16 mb-2"
          )
          CollectionMetadata(
            class="flex-auto lg:mx-1"
            :value="value"
          )
            template(#recollect-button)
              button.form-button(
                type="button"
                :disabled="recollectingCount > 0"
                @click="recollect()"
                class="ml-1"
              )
                template(v-if="recollectingCount > 0 ")
                  FaIcon.h-full(name="spinner" spin)
                template(v-else)
                  | 收集
          hr.border-gray-700.my-2
          PresentationMetadata(
            class="flex-auto lg:mx-1"
            v-if="presentation"
            :value="presentation"
          )
          hr.border-gray-700.my-2
          .block(class="lg:mx-1")
            span 查看器背景
            Radio(
              v-model="preferredBackground"
              class="inline-block py-1 ml-1"
              :options=`[
                { key: "checkboard", value: "checkboard", label: "棋盘格", },
                { key: "checkboard-sm", value: "checkboard-sm", label: "棋盘格(小)", },
                { key: "white", value: "white", label: "纯白" },
                { key: "black", value: "black", label: "纯黑" },
              ]`
            )
      template(v-for="i in prefetchURLs")
        link(rel="prefetch" :href="i")
</template>

<script lang="ts">
import PresentationViewer from '@/components/PresentationViewer.vue';
import db from '@/db';
import {
  collectFromCGTeamwork,
  collectFromCGTeamworkVariables,
} from '@/graphql/types/collectFromCGTeamwork';
import {
  collectFromFolder,
  collectFromFolderVariables,
} from '@/graphql/types/collectFromFolder';
import { info } from '@/message';
import toHotKey from '@/utils/toHotKey';
import * as sentry from '@sentry/browser';
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
import { filePathFormat } from '../const';
import { Collection } from '../graphql/types/Collection';
import {
  collectionNode,
  collectionNodeVariables,
} from '../graphql/types/collectionNode';
import { Presentation as PresentationData } from '../graphql/types/Presentation';
import CollectionMetadata from './CollectionMetadata.vue';
import Presentation from './Presentation.vue';
import PresentationMetadata from './PresentationMetadata.vue';
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
    sentry.addBreadcrumb({
      category: 'collection-viewer',
      message: 'open',
      level: sentry.Severity.Info,
      data: { value: this.value },
    });
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
        case '^z': {
          e.preventDefault();
          this.$refs.presentationViewer?.annotation?.editor.undo();
          break;
        }
        case '^y': {
          e.preventDefault();
          this.$refs.presentationViewer?.annotation?.editor.redo();
          break;
        }
        case 'q': {
          e.preventDefault();
          this.$refs.presentationViewer?.annotation?.setPainter('null');
          break;
        }
        case 'w': {
          e.preventDefault();
          this.$refs.presentationViewer?.annotation?.setPainter('select');
          break;
        }
        case 'e': {
          e.preventDefault();
          this.$refs.presentationViewer?.annotation?.setPainter('polyline');
          break;
        }
        case 'r': {
          e.preventDefault();
          this.$refs.presentationViewer?.annotation?.setPainter('rectangle');
          break;
        }
        case 't': {
          e.preventDefault();
          this.$refs.presentationViewer?.annotation?.setPainter('ellipse');
          break;
        }
        case 'y': {
          e.preventDefault();
          this.$refs.presentationViewer?.annotation?.setPainter('text');
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

  apollo: {
    node: {
      query: require('@/graphql/queries/collectionNode.gql'),
      variables(): collectionNodeVariables {
        return { id: this.value.id, filePathFormat };
      },
      update(v: collectionNode) {
        // XXX: value prop is not reactive when using modal.show
        // So we need update manually.
        this.$emit('update:value', v.node);
      },
    },
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
      sentry.addBreadcrumb({
        category: 'collection-viewer',
        message: 'jumpPrev',
        level: sentry.Severity.Info,
        data: { from: this.value, to: this.prev },
      });
      this.$refs.prev.classList.add('button-click-anim');
      this.$emit('update:value', this.prev);
    }
  }

  jumpNext(): void {
    if (this.next) {
      sentry.addBreadcrumb({
        category: 'collection-viewer',
        message: 'jumpNext',
        level: sentry.Severity.Info,
        data: { from: this.value, to: this.next },
      });
      this.$refs.next.classList.add('button-click-anim');
      this.$emit('update:value', this.next);
    }
  }

  close(): void {
    sentry.addBreadcrumb({
      category: 'collection-viewer',
      message: 'close',
      level: sentry.Severity.Info,
      data: { value: this.value },
    });
    this.visible = false;
  }

  get prefetchURLs(): string[] {
    const ret: string[] = [];
    for (const i of [this.next, this.value, this.prev]) {
      if (!i) {
        continue;
      }
      sortBy(i.presentations, [i => -new Date(i.raw.modTime ?? 0).getTime()])
        .slice(0, 5)
        .forEach(j => {
          ret.push(j.regular?.url || require('@/assets/img/transcoding.svg'));
        });
    }
    return uniq(ret);
  }

  get presentation(): PresentationData | undefined {
    return this.value.presentations.find(i => i.id === this.presentationID);
  }

  async refetch(): Promise<void> {
    await this.$apollo.queries.node.refetch();
  }

  get preferredBackground(): string {
    return db.preference.get('viewerBackground');
  }

  set preferredBackground(v: string) {
    db.preference.set('viewerBackground', v);
  }

  async recollect(): Promise<void> {
    sentry.addBreadcrumb({
      category: 'collection-viewer',
      message: 'recollect',
      level: sentry.Severity.Info,
      data: { value: this.value },
    });
    this.recollectingCount += 1;
    try {
      const parts = this.value.origin.split(':');
      switch (parts[0]) {
        case 'folder':
          await this.$apollo.mutate<
            collectFromFolder,
            collectFromFolderVariables
          >({
            mutation: require('@/graphql/mutations/collectFromFolder.gql'),
            variables: { input: { root: parts.slice(1).join(':') } },
          });
          break;
        case 'cgteamwork':
          await this.$apollo.mutate<
            collectFromCGTeamwork,
            collectFromCGTeamworkVariables
          >({
            mutation: require('@/graphql/mutations/collectFromCGTeamwork.gql'),
            variables: {
              input: {
                database: parts[1],
                pipeline: parts[2],
                prefix: parts.slice(3).join(':'),
              },
            },
          });
          break;
      }
      await this.refetch();
      info('更新成功');
    } finally {
      this.recollectingCount -= 1;
    }
  }

  get width(): number {
    const v = parseFloat(
      this.presentation?.metadata.find(i => i.k === 'width')?.v ?? ''
    );
    if (!isFinite(v)) {
      return 1920;
    }
    return v;
  }

  get height(): number {
    const v = parseFloat(
      this.presentation?.metadata.find(i => i.k === 'height')?.v ?? ''
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
