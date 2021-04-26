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
            ref="prevButton"
            class="h-full text-gray-400 hover:text-gray-200 disabled:text-gray-600 outline-none"
            :disabled="!prev"
            title="上一个（快捷键：↑）"
            @click="jumpPrev()"
          >
            <FaIcon class="h-full" name="caret-square-up"></FaIcon>
          </button>
          <button
            ref="nextButton"
            class="h-full text-gray-400 ml-1 hover:text-gray-200 disabled:text-gray-600 outline-none"
            :disabled="!next"
            title="下一个（快捷键：↓）"
            @click="jumpNext()"
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
        >
          <template #fullscreenToolbar>
            <p class="mx-1">{{ value.title }}</p>
            <button
              class="form-button h-8 m-px inline-flex flex-center"
              :disabled="!prev"
              title="上一个（快捷键：↑）"
              @click="jumpPrev()"
            >
              <FaIcon class="h-full" name="caret-up"></FaIcon>
            </button>
            <button
              class="form-button h-8 m-px inline-flex flex-center"
              :disabled="!next"
              title="下一个（快捷键：↓）"
              @click="jumpNext()"
            >
              <FaIcon class="h-full" name="caret-down"></FaIcon>
            </button>
          </template>
        </PresentationViewer>
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
import { computed, defineComponent, PropType, ref } from '@vue/composition-api';
import 'vue-awesome/icons/backward';
import 'vue-awesome/icons/camera';
import 'vue-awesome/icons/caret-down';
import 'vue-awesome/icons/caret-square-down';
import 'vue-awesome/icons/caret-square-up';
import 'vue-awesome/icons/caret-up';
import 'vue-awesome/icons/fast-backward';
import 'vue-awesome/icons/fast-forward';
import 'vue-awesome/icons/forward';
import 'vue-awesome/icons/pause';
import 'vue-awesome/icons/play';
import 'vue-awesome/icons/step-backward';
import 'vue-awesome/icons/step-forward';
import 'vue-awesome/icons/window-close';
import { Collection } from '../graphql/types/Collection';
import CollectionMetadata from './CollectionMetadata.static.vue';
import { setupCommon, setupKeyboardShortcut } from './CollectionViewer';
import Presentation from './Presentation.static.vue';
import PresentationMetadata from './PresentationMetadata.static.vue';
import PresentationSelect from './PresentationSelect.vue';

export default defineComponent({
  name: 'CollectionViewer',
  props: {
    value: {
      type: Object as PropType<Collection>,
      required: true,
    },
    prev: {
      type: Object as PropType<Collection>,
    },
    next: {
      type: Object as PropType<Collection>,
    },
  },
  components: {
    Presentation,
    PresentationSelect,
    CollectionMetadata,
    PresentationMetadata,
    PresentationViewer,
  },
  setup(props, ctx) {
    const value = computed(() => props.value);
    const prev = computed(() => props.prev);
    const next = computed(() => props.next);

    const prevButton = ref<HTMLButtonElement>();
    const nextButton = ref<HTMLButtonElement>();
    const presentationViewer = ref<InstanceType<typeof PresentationViewer>>();
    const {
      jumpNext,
      jumpPrev,
      visible,
      close,
      prefetchURLs: _prefetchURLs,
      presentationID,
      presentation,
    } = setupCommon(ctx, {
      value,
      prev,
      next,
      prevButton,
      nextButton,
    });
    const prefetchURLs = computed(() =>
      _prefetchURLs.value.map((i) => relativeURL(i))
    );

    setupKeyboardShortcut({
      skipEvent: (e) =>
        !(
          e.target === document.body ||
          e.target instanceof HTMLButtonElement ||
          e.target === presentationViewer.value?.$el ||
          e.target === presentationViewer.value?.annotation?.$el
        ),
      firstFrame: computed(
        () => presentationViewer.value?.presentation?.firstFrame ?? 0
      ),
      lastFrame: computed(
        () => presentationViewer.value?.presentation?.lastFrame ?? 0
      ),
      jumpPrev,
      jumpNext,
      presentationControls: computed(() => presentationViewer.value?.controls),
      close,
    });

    return {
      presentationID,
      close,
      jumpNext,
      jumpPrev,
      nextButton,
      prefetchURLs,
      presentation,
      presentationViewer,
      prevButton,
      viewerBackground,
      visible,
    };
  },
});
</script>
