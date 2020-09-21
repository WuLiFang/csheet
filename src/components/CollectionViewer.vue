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
            class="h-full text-gray-400 hover:text-gray-200 outline-none"
            title="关闭（快捷键：Esc）"
            @click="close()"
          )
            FaIcon.h-full(name="window-close")
          button(
            ref="prev"
            class="h-full text-gray-400 ml-1 hover:text-gray-200 disabled:text-gray-600"
            class="outline-none"
            :disabled="!prev"
            @click="jumpPrev()"
            @animationend="$event.target.classList.remove('button-click-anim')"
            title="上一个（快捷键：←）"
          )
            FaIcon.h-full(name="caret-square-left")
          button(
            ref="next"
            class="h-full text-gray-400 ml-1 hover:text-gray-200 disabled:text-gray-600"
            class="outline-none"
            :disabled="!next"
            title="下一个（快捷键：→）"
            @click="jumpNext()"
            @animationend="$event.target.classList.remove('button-click-anim')"
          )  
            FaIcon.h-full(name="caret-square-right")
        h1(
          class="text-2xl text-gray-400 break-words"
        ) {{value.title}}
        p(
          class="text-sm text-gray-500 select-all break-words"
        ) {{presentation && presentation.raw.path}}
      main(
        class="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden"
      )
        .viewport(
          class="relative text-center lg:w-2/3"
          :class=`{[backgroundClass]: true}`
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
          transition(
            enter-class="opacity-0"
            leave-to-class="opacity-0"
            enter-active-class="transition-all duration-500 ease-in"
            leave-active-class="transition-all duration-500 ease-out"
          )
            Presentation(
              :key="value.id"
              class="object-contain w-full h-full absolute inset-0"
              :id="presentationID"
              size="regular"
              autoplay
            )
          //- placeholder for small screen
          Presentation(
            class="object-contain w-full h-full invisible"
            :id="presentationID"
            size="thumb"
          )
        aside(
          class="flex-auto bg-gray-900 lg:flex-initial lg:w-1/3 lg:overflow-auto"
          :style="{ filter: `blur(${loadingCount * 5}px)` }"
        )
          PresentationSelect(
            v-show="value.presentations.length > 0"
            v-model="presentationID"
            :options="value.presentations"
            class="min-h-16"
          )
          label(
            class="block mt-2 lg:mx-1"
          )
            span 查看器背景
            select(
              v-model="preferredBackground"
              class="form-select py-1 ml-1"
            )
              option(value="checkboard") 棋盘格
              option(value="black") 纯黑
          CollectionMetadata(
            class="flex-auto lg:mx-1"
            :value="value"
          )
            template(#recollect-button)
              button(
                type="button"
                :disabled="recollectingCount > 0"
                @click="recollect()"
                class="h-8 bg-gray-700 hover:bg-gray-600 py-1 px-2 rounded-sm ml-1"
              ) 
                template(v-if="recollectingCount > 0 ")
                  FaIcon.h-full(name="spinner" spin)
                template(v-else)
                  | 收集
</template>

<script lang="ts">
import { Component,  Mixins, Prop } from 'vue-property-decorator';
import { ModalMixin } from '../mixins/ModalMixin';
import Presentation, { fileSrc } from './Presentation.vue';
import { collection as Collection } from '../graphql/types/collection';
import 'vue-awesome/icons/window-close';
import 'vue-awesome/icons/caret-square-left';
import 'vue-awesome/icons/caret-square-right';
import PresentationSelect from './PresentationSelect.vue';
import {
  collectionNode,
  collectionNodeVariables,
} from '../graphql/types/collectionNode';
import CollectionMetadata from './CollectionMetadata.vue';
import { filePathFormat } from '../const';
import * as preference from '@/preference';
import * as sentry from '@sentry/browser';
import { presentation } from '../graphql/types/presentation';

@Component<CollectionViewer>({
  components: {
    Presentation,
    PresentationSelect,
    CollectionMetadata,
  },
  mounted() {
    sentry.addBreadcrumb({
      category: 'collection-viewer',
      message: 'open',
      level: sentry.Severity.Info,
      data: { value: this.value },
    });
    const keyupListener = (e: KeyboardEvent) => {
      if (e.target !== document.body) {
        return
      }
      if (e.shiftKey || e.ctrlKey || e.altKey) {
        return;
      }
      switch (e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          this.jumpPrev();
          break;
        case 'ArrowRight':
          this.jumpNext();
          break;
      }
    };
    document.body.addEventListener('keyup', keyupListener);
    this.$once('destroyed', () => {
      document.body.removeEventListener('keyup', keyupListener);
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
  };

  presentationID = '';
  loadingCount = 0;
  recollectingCount = 0;

  jumpPrev():void {
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

  jumpNext() :void{
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

  close():void {
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
