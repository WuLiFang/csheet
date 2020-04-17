<template lang="pug">
  transition(
    name="viewer"
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
            class="h-full text-gray-400 hover:text-gray-200"
            title="关闭（快捷键：Esc）"
            @click="close()"
          )
            FaIcon.h-full(name="window-close")
          button(
            class="h-full text-gray-400 ml-1 hover:text-gray-200 disabled:text-gray-600"
            :disabled="!prev"
            @click="jumpPrev()"
            title="上一个（快捷键：←）"
          )
            FaIcon.h-full(name="caret-square-left")
          button(
            class="h-full text-gray-400 ml-1 hover:text-gray-200 disabled:text-gray-600"
            :disabled="!next"
            title="下一个（快捷键：→）"
            @click="jumpNext()"
          )  
            FaIcon.h-full(name="caret-square-right")
        h1(
          class="text-2xl text-gray-400 break-words"
        ) {{value.title}}
        p(
          class="text-sm text-gray-500 select-all break-words"
        ) {{presentation && presentation.raw.path}}
      transition(
        :name="mainTransitionName"
        mode="out-in"
      )
        main(
          :key="value.id"
          class="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden"
        )
          .viewport(
            class="flex-auto lg:w-2/3 lg:flex-auto lg:flex lg:flex-col text-center lg:items-center bg-black "
          )
            template(v-for="i in prefetchURLs")
              link(rel="prefetch" :href="i")
            p(
              v-if="presentation && presentation.isRegularOutdated"
              class="bg-orange-500 w-full"
            ) 预览已过期
            Presentation(
              class="m-auto object-contain max-h-full"
              :id="presentationID"
              size="regular"
            )
          aside(
            class="flex-auto lg:flex-initial lg:w-1/3 bg-gray-900"
            :style="{ filter: `blur(${loadingCount * 5}px)` }"
          )
            PresentationSelect(
              v-show="value.presentations.length > 0"
              v-model="presentationID"
              :options="value.presentations"
              class="min-h-16"
            )
            CollectionMetadata(
              class="flex-auto"
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
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator';
import { ModalMixin } from '../mixins/ModalMixin';
import Presentation, { fileSrc } from './Presentation.vue';
import App from '../App.vue';
import { show } from '../modal';
import { collections_collections as Collections } from '../graphql/types/collections';
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

@Component<CollectionViewer>({
  components: {
    Presentation,
    PresentationSelect,
    CollectionMetadata,
  },
  mounted() {
    const keyupListener = (e: KeyboardEvent) => {
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
    window.addEventListener('keyup', keyupListener);
    this.$once('destroyed', () => {
      window.removeEventListener('keyup', keyupListener);
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

  mainTransitionName = '';
  presentationID = '';
  loadingCount = 0;

  jumpPrev() {
    if (this.prev) {
      this.mainTransitionName = 'right';
      this.$emit('update:value', this.prev);
    }
  }

  jumpNext() {
    if (this.next) {
      this.mainTransitionName = 'left';
      this.$emit('update:value', this.next);
    }
  }

  close() {
    this.$_visible = false;
  }

  get prefetchURLs(): string[] {
    const ret: string[] = [];
    for (const i of [this.next, this.prev]) {
      if (!i) {
        continue;
      }
      i.presentations.forEach(j => {
        ret.push(fileSrc(j.regular?.path));
      });
    }
    return ret;
  }

  get presentation() {
    return this.value.presentations.find(i => i.id == this.presentationID);
  }
  async refetch() {
    await this.$apollo.queries.node.refetch();
  }

  recollectingCount = 0;
  async recollect() {
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
.viewer-enter,
.viewer-leave-to {
  transform: translateY(-100%);
}

.viewer-enter-active,
.viewer-leave-active {
  @apply transition-transform;
  @apply ease-in-out;
  @apply duration-300;
}

.left-enter,
.right-leave-to {
  @apply opacity-0;
  transform: translateX(20%);
}
.right-enter,
.left-leave-to {
  @apply opacity-0;
  transform: translateX(-20%);
}

.left-enter-active,
.left-leave-active,
.right-enter-active,
.right-leave-active {
  @apply ease-out;
  @apply duration-100;
}
</style>
