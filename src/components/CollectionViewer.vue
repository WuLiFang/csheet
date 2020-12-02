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
        .player(
          class="flex-none relative text-center lg:w-2/3 lg:h-full flex flex-col"
        )
          PresentationAnnotationEditorToolbar(
            v-if="$refs.annotation"
            :parent="$refs.annotation"
            v-show="presentationID"
          )
            template(#right)
              button.form-button(
                class="h-8 m-px"
                class="inline-flex flex-center"
                type="button"
                @click="saveScreenshot()"
                title="保存截图"
              )
                FaIcon(name="camera")
          template(v-for="i in prefetchURLs")
            link(rel="prefetch" :href="i")
          p(
            v-if="presentation && presentation.isRegularTranscodeFailed"
            class="bg-red-500 w-full"
          ) 预览转码失败，重新收集以重试
          p(
            v-else-if="presentation && presentation.isRegularOutdated"
            class="bg-orange-500 w-full"
          ) 预览已过期
          .viewport(
            class="relative text-center flex-auto z-10"
            :class=`{[backgroundClass]: true}`
          )
            transition(
              enter-class="opacity-0"
              leave-to-class="opacity-0"
              enter-active-class="transition-all duration-500 ease-in"
              leave-active-class="transition-all duration-500 ease-out"
            )
              Presentation(
                ref="presentation"
                :key="value.id"
                class="object-contain w-full h-full absolute inset-0"
                :id="presentationID"
                size="regular"
                autoplay
                :controls="$refs.annotation && $refs.annotation.currentPainter === 'null'"
                :playbackRate="playbackRate"
                @frameUpdate="currentFrame = $event"
                @timeUpdate="currentTime = $event"
              )
            //- placeholder for small screen
            Presentation(
              class="object-contain w-full h-full invisible lg:hidden"
              :id="presentationID"
              size="thumb"
            )
            PresentationAnnotationEditor(
              ref="annotation"
              :id="presentationID"
              :frame="currentFrame"
              :painter.sync="preferredPainter"
              class="object-contain w-full h-full absolute inset-0"
              @draw-start="$refs.presentation.pause()"
            )
          PresentationControls(
            ref="presentationControls"
            v-if="$refs.presentation && $refs.presentation.type === 'video'"
            class="flex flex-col sm:flex-row overflow-x-hidden flex-wrap justify-center items-center z-0"
            :parent="$refs.presentation"
            :playbackRate.sync="playbackRate"
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
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Presentation from './Presentation.vue';
import { Collection } from '../graphql/types/Collection';
import 'vue-awesome/icons/window-close';
import 'vue-awesome/icons/caret-square-up';
import 'vue-awesome/icons/caret-square-down';
import 'vue-awesome/icons/forward';
import 'vue-awesome/icons/backward';
import 'vue-awesome/icons/step-forward';
import 'vue-awesome/icons/step-backward';
import 'vue-awesome/icons/fast-forward';
import 'vue-awesome/icons/fast-backward';
import 'vue-awesome/icons/pause';
import 'vue-awesome/icons/play';
import 'vue-awesome/icons/camera';
import PresentationSelect from './PresentationSelect.vue';
import {
  collectionNode,
  collectionNodeVariables,
} from '../graphql/types/collectionNode';
import CollectionMetadata from './CollectionMetadata.vue';
import PresentationMetadata from './PresentationMetadata.vue';
import { filePathFormat } from '../const';
import db from '@/db';
import * as sentry from '@sentry/browser';
import toHotKey from '@/utils/toHotKey';
import { Presentation as PresentationData } from '../graphql/types/Presentation';
import { throttle } from 'lodash';
import PresentationAnnotationEditor from './PresentationAnnotationEditor.vue';
import PresentationAnnotationEditorToolbar from './PresentationAnnotationEditorToolbar.vue';
import PresentationControls from './PresentationControls.vue';
import { saveAs } from 'file-saver';
import { info } from '@/message';
import {
  collectFromCGTeamwork,
  collectFromCGTeamworkVariables,
} from '@/graphql/types/collectFromCGTeamwork';
import {
  collectFromFolderVariables,
  collectFromFolder,
} from '@/graphql/types/collectFromFolder';

@Component<CollectionViewer>({
  components: {
    Presentation,
    PresentationSelect,
    CollectionMetadata,
    PresentationMetadata,
    PresentationAnnotationEditor,
    PresentationAnnotationEditorToolbar,
    PresentationControls,
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
          e.target === this.$refs.presentation?.$el ||
          e.target === this.$refs.prev ||
          e.target === this.$refs.next ||
          e.target === this.$refs.annotation?.$el
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
          if (this.$refs.presentation?.paused) {
            this.$refs.presentation?.play();
          } else {
            this.$refs.presentation?.pause();
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
            this.$refs.presentation?.seekFrameOffset(-1, true);
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          throttleRepeatSeek(() => {
            this.$refs.presentation?.seekFrameOffset(1, true);
          });
          break;
        case '+ArrowLeft':
          e.preventDefault();
          throttleRepeatSeek(() => {
            this.$refs.presentationControls?.skipFrameBackward();
          });
          break;
        case '+ArrowRight':
          e.preventDefault();
          throttleRepeatSeek(() => {
            this.$refs.presentationControls?.skipFrameForward();
          });
          break;
        case 'Home':
          e.preventDefault();
          this.$refs.presentation?.seekFrame(
            this.$refs.presentation?.firstFrame,
            true
          );
          break;
        case 'End':
          e.preventDefault();
          this.$refs.presentation?.seekFrame(
            this.$refs.presentation?.lastFrame,
            true
          );
          break;
        case 'g': {
          e.preventDefault();
          this.$refs.presentationControls?.$refs.timeInput?.$el.select();
          break;
        }
        case 'f': {
          e.preventDefault();
          this.$refs.presentationControls?.$refs.frameInput?.$el.select();
          break;
        }
        case 'j': {
          e.preventDefault();
          this.$refs.presentationControls?.offsetPlaybackRateIndex(-1);
          break;
        }
        case 'k': {
          e.preventDefault();
          this.$refs.presentationControls?.setPlaybackRate(1);
          break;
        }
        case 'l': {
          e.preventDefault();
          this.$refs.presentationControls?.offsetPlaybackRateIndex(1);
          break;
        }
        case '^z': {
          e.preventDefault();
          this.$refs.annotation?.editor.undo();
          break;
        }
        case '^y': {
          e.preventDefault();
          this.$refs.annotation?.editor.redo();
          break;
        }
        case 'q': {
          e.preventDefault();
          this.$refs.annotation?.setPainter('null');
          break;
        }
        case 'w': {
          e.preventDefault();
          this.$refs.annotation?.setPainter('select');
          break;
        }
        case 'e': {
          e.preventDefault();
          this.$refs.annotation?.setPainter('polyline');
          break;
        }
        case 'r': {
          e.preventDefault();
          this.$refs.annotation?.setPainter('rectangle');
          break;
        }
        case 't': {
          e.preventDefault();
          this.$refs.annotation?.setPainter('ellipse');
          break;
        }
        case 'y': {
          e.preventDefault();
          this.$refs.annotation?.setPainter('text');
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
      const data = await this.screenshot();
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
    presentation: Presentation;
    presentationControls: PresentationControls;
    annotation: PresentationAnnotationEditor;
  };

  visible = true;
  presentationID = '';
  loadingCount = 0;
  recollectingCount = 0;
  currentTime = 0;
  currentFrame = 0;
  playbackRate = 1;

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
      i.presentations.forEach(j => {
        ret.push(j.regular?.url || require('@/assets/img/transcoding.svg'));
      });
    }
    return ret;
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

  get preferredPainter(): string {
    return db.preference.get('viewerAnnotationPainter');
  }

  set preferredPainter(v: string) {
    db.preference.set('viewerAnnotationPainter', v);
  }

  get backgroundClass(): string {
    switch (this.preferredBackground) {
      case 'checkboard':
        return 'bg-checkboard';
      case 'checkboard-sm':
        return 'bg-checkboard-sm';
      case 'white':
        return 'bg-white';
      default:
        return 'bg-black';
    }
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

  async screenshot(type = 'image/jpeg', quality = 1): Promise<Blob | null> {
    if (!this.presentation) {
      return null;
    }
    const bg = this.$refs.presentation.$el;
    const canvas = document.createElement('canvas');
    let w = bg.width;
    let h = bg.height;
    if (bg instanceof HTMLVideoElement) {
      w = bg.videoWidth;
      h = bg.videoHeight;
    } else if (bg instanceof HTMLImageElement) {
      w = bg.naturalWidth;
      h = bg.naturalHeight;
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2d context not supported ');
    }

    ctx.drawImage(bg, 0, 0, w, h);
    if (this.$refs.annotation.painter !== 'null') {
      const el = this.$refs.annotation.$el;
      await new Promise(resolve => {
        const svg = new Blob([new XMLSerializer().serializeToString(el)], {
          type: 'image/svg+xml',
        });
        const src = URL.createObjectURL(svg);
        const img = document.createElement('img');
        img.onload = () => {
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(src);
          resolve();
        };
        img.src = src;
      });
    }

    return new Promise(resolve => {
      canvas.toBlob(
        v => {
          resolve(v);
        },
        type,
        quality
      );
    });
  }

  async saveScreenshot(): Promise<void> {
    const data = await this.screenshot('image/jpeg');
    if (!data) {
      return;
    }
    saveAs(
      data,
      this.presentation?.type === 'video'
        ? `${this.value.origin}.${this.$refs.presentation.currentFrame}.jpg`
        : `${this.value.origin}.jpg`
    );
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
