<template lang="pug">
  transition(
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
          class="text-2xl text-gray-400 break-words"
        ) {{value.title}}
        p(
          class="text-sm text-gray-500 select-all break-words"
        ) {{presentation && presentation.raw.path}}
      main(
        class="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden"
      )
        .player(
          class="relative text-center lg:w-2/3 h-full flex flex-col"
        )
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
            class="relative text-center flex-auto"
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
                :playbackRate="formData.playbackRate"
                @frameUpdate="currentFrame = $event"
                @timeUpdate="currentTime = $event"
              )
            //- placeholder for small screen
            Presentation(
              class="object-contain w-full h-full invisible"
              :id="presentationID"
              size="thumb"
            )
          .flex(
            v-if="$refs.presentation && $refs.presentation.type === 'video'"
            class="flex-col sm:flex-row overflow-x-hidden flex-wrap justify-center items-center"
          )
            .inline-flex(
              v-if="$refs.presentation.frameRate > 0"
              class="sm:order-2 flex-wrap justify-center my-px sm:mx-1"
            )
              button.form-button(
                type="button"
                class="flex-none p-0 w-12 h-8 m-px"
                class="flex justify-center items-center"
                title="至起始帧（快捷键：Home）"
                @click="() => $refs.presentation.seekFrame($refs.presentation.firstFrame, true)"
              ) 
                FaIcon(name="fast-backward")
              button.form-button(
                type="button"
                class="flex-none p-0 w-12 h-8 m-px"
                class="flex justify-center items-center"
                title="上一帧（快捷键：←）"
                @click="() => $refs.presentation.seekFrameOffset(-1, true)"
              ) 
                FaIcon(name="step-backward")
              input.form-input(
                ref="frameInput"
                type="number"
                class="flex-auto w-24 h-8 spin-button-none z-10 text-center m-px"
                :value="hasFocus ? formData.currentFrame : currentFrame"
                @input="e => {formData.currentFrame = parseFloat(e.target.value); $refs.presentation.seekFrame(this.formData.currentFrame, true);}"
                @keyup.enter="$event.target.blur()"
                @focus="hasFocus = true; formData.currentFrame = currentFrame; $event.target.select()"
                @blur="hasFocus = false;"
                title="当前帧（快捷键：f）"
              )
              button.form-button(
                type="button"
                class="flex-none p-0 w-12 h-8 m-px"
                class="flex justify-center items-center"
                title="下一帧（快捷键：→）"
                @click="() => $refs.presentation.seekFrameOffset(1, true)"
              ) 
                FaIcon(name="step-forward")
              button.form-button(
                type="button"
                class="flex-none p-0 w-12 h-8 m-px"
                class="flex justify-center items-center"
                title="至结束帧（快捷键：End）"
                @click="() => $refs.presentation.seekFrame($refs.presentation.lastFrame, true)"
              ) 
                FaIcon(name="fast-forward")
            .inline-flex.items-center(
              class="flex-wrap sm:order-3 my-px sm:mx-1"
            )
              DurationInput(
                ref="timeInput"
                v-model="currentTimeProxy"
                class="h-8 w-32 m-px text-center"
                title="当前时间（快捷键：g）"
              )
              button.form-button(
                type="button"
                class="flex-initial p-0 w-24 h-8 m-px"
                class="flex justify-center items-center"
                title="播放/暂停（快捷键：空格）"
                @click="() => $refs.presentation.paused ? $refs.presentation.play(): $refs.presentation.pause()"
              ) 
                FaIcon(:name="$refs.presentation.paused ? 'play' : 'pause'")
              select.form-select(
                ref="playbackRateSelect"
                class="flex-initial p-0 pl-2 w-20 h-8  m-px"
                v-model="formData.playbackRate"
                title="播放倍速 （快捷键：j/k/l）"
              )
                option(
                  v-for="i in playbackRateOptions"
                  :value="i"
                ) ×{{i.toFixed(1)}}
            .inline-flex.items-center(
              v-if="$refs.presentation.frameRate > 0"
              class="sm:order-1 my-px sm:mx-1"
            )
              button.form-button(
                type="button"
                class="flex-none p-0 w-10 h-6 m-px"
                class="flex justify-center items-center"
                title="向前跳帧（快捷键：Shift + ←）"
                @click="() => $refs.presentation.seekFrameOffset(-formData.frameSkip, true)"
              ) 
                FaIcon.object-center(name="backward")
              input.form-input(
                type="number"
                class="flex-auto p-0 w-12 h-6 spin-button-none z-10 text-center"
                v-model.number="formData.frameSkip"
                @keyup.enter="$event.target.blur()"
                @focus="$event.target.select()"
                title="跳帧的帧数"
              )
              button.form-button(
                type="button"
                class="flex-none p-0 w-10 h-6 m-px"
                class="flex justify-center items-center"
                title="向后跳帧（快捷键：Shift + →）"
                @click="() => $refs.presentation.seekFrameOffset(formData.frameSkip, true)"
              ) 
                FaIcon(name="forward")
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
          label(
            class="block lg:mx-1"
          )
            span 查看器背景
            select.form-select(
              v-model="preferredBackground"
              class="inline-block py-1 ml-1"
            )
              option(value="checkboard") 棋盘格
              option(value="black") 纯黑
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { ModalMixin } from '../mixins/ModalMixin';
import Presentation, { fileSrc } from './Presentation.vue';
import { collection as Collection } from '../graphql/types/collection';
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
import PresentationSelect from './PresentationSelect.vue';
import {
  collectionNode,
  collectionNodeVariables,
} from '../graphql/types/collectionNode';
import CollectionMetadata from './CollectionMetadata.vue';
import PresentationMetadata from './PresentationMetadata.vue';
import { filePathFormat } from '../const';
import * as preference from '@/preference';
import * as sentry from '@sentry/browser';
import toHotKey from '@/utils/toHotKey';
import { presentation } from '../graphql/types/presentation';
import { throttle } from 'lodash';
import DurationInput from './DurationInput.vue';
import moment from 'moment';

@Component<CollectionViewer>({
  components: {
    Presentation,
    PresentationSelect,
    CollectionMetadata,
    PresentationMetadata,
    DurationInput,
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
          e.target === this.$refs.presentation?.$el ||
          e.target === this.$refs.prev ||
          e.target === this.$refs.next
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
            this.$refs.presentation?.seekFrameOffset(
              -this.formData.frameSkip,
              true
            );
          });
          break;
        case '+ArrowRight':
          e.preventDefault();
          throttleRepeatSeek(() => {
            this.$refs.presentation?.seekFrameOffset(
              this.formData.frameSkip,
              true
            );
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
          const el = this.$refs.timeInput?.$el;
          if (el) {
            el.focus();
          }
          break;
        }
        case 'f': {
          e.preventDefault();
          const el = this.$refs.frameInput;
          if (el) {
            el.select();
          }
          break;
        }
        case 'j': {
          e.preventDefault();
          const o = this.playbackRateOptions;
          this.formData.playbackRate =
            o[Math.max(0, o.indexOf(this.formData.playbackRate) - 1)];
          break;
        }
        case 'k': {
          e.preventDefault();
          this.formData.playbackRate = 1;
          break;
        }
        case 'l': {
          e.preventDefault();
          const o = this.playbackRateOptions;
          this.formData.playbackRate =
            o[
              Math.min(o.length - 1, o.indexOf(this.formData.playbackRate) + 1)
            ];
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
export default class CollectionViewer extends Mixins(ModalMixin) {
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
    frameInput: HTMLInputElement;
    playbackRateSelect: HTMLSelectElement;
    timeInput: DurationInput;
  };

  presentationID = '';
  loadingCount = 0;
  recollectingCount = 0;
  currentTime = 0;
  currentFrame = 0;
  hasFocus = false;

  playbackRateOptions = [0.1, 0.2, 0.5, 1, 2, 4, 8];
  formData = {
    currentFrame: 0,
    frameSkip: 10,
    playbackRate: 1,
  };

  get currentTimeProxy(): string {
    return moment.duration(this.currentTime * 1e3).toISOString();
  }

  set currentTimeProxy(s: string) {
    const v = moment.duration(s).asSeconds();
    this.$refs.presentation.seek(v, true);
  }

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
    this.$_visible = false;
  }

  get prefetchURLs(): string[] {
    const ret: string[] = [];
    for (const i of [this.next, this.value, this.prev]) {
      if (!i) {
        continue;
      }
      i.presentations.forEach(j => {
        ret.push(fileSrc(j.regular?.url));
      });
    }
    return ret;
  }

  get presentation(): presentation | undefined {
    return this.value.presentations.find(i => i.id === this.presentationID);
  }

  async refetch(): Promise<void> {
    await this.$apollo.queries.node.refetch();
  }

  get preferredBackground(): string {
    return preference.get('viewerBackground');
  }

  set preferredBackground(v: string) {
    preference.set('viewerBackground', v);
  }

  get backgroundClass(): string {
    switch (this.preferredBackground) {
      case 'checkboard':
        return 'bg-checkboard';
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
          await this.$apollo.mutate({
            mutation: require('@/graphql/mutations/collectFromFolder.gql'),
            variables: {
              root: parts.slice(1).join(':'),
            },
          });
          break;
        case 'cgteamwork':
          await this.$apollo.mutate({
            mutation: require('@/graphql/mutations/collectFromCGTeamwork.gql'),
            variables: {
              database: parts[1],
              pipeline: parts[2],
              prefix: parts.slice(3).join(':'),
            },
          });
          break;
      }
      await this.refetch();
      this.$root.$emit('app-message', '更新成功');
    } finally {
      this.recollectingCount -= 1;
    }
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

.bg-checkboard {
  background-image: url('../assets/img/checkboard.svg');
}
</style>
