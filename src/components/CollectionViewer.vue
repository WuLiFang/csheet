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
            class="form-button h-full text-gray-400 hover:text-gray-200 disabled:text-gray-600 outline-none"
            :disabled="!prev"
            title="上一个（快捷键：↑）"
            @click="jumpPrev()"
          >
            <svg class="fill-current h-full" viewBox="4 4 16 16">
              <path :d="mdiMenuUp" />
            </svg>
          </button>
          <button
            ref="nextButton"
            class="form-button h-full text-gray-400 ml-1 hover:text-gray-200 disabled:text-gray-600 outline-none"
            :disabled="!next"
            title="下一个（快捷键：↓）"
            @click="jumpNext()"
          >
            <svg class="fill-current h-full" viewBox="4 4 16 16">
              <path :d="mdiMenuDown" />
            </svg>
          </button>
          <button
            class="form-button h-full text-gray-400 ml-1 hover:text-gray-200 outline-none"
            title="关闭（快捷键：Esc）"
            @click="close()"
          >
            <svg class="fill-current h-full" viewBox="0 0 24 24">
              <path :d="mdiClose" />
            </svg>
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
          :id="presentationID"
          ref="presentationViewer"
          class="flex-none relative text-center lg:w-2/3 lg:h-full flex flex-col"
        >
          <template #fullscreenToolbar
            ><span class="mx-1">{{ value.title }}</span>
            <button
              class="form-button h-8 m-px inline-flex flex-center"
              :disabled="!prev"
              title="上一个（快捷键：↑）"
              @click="jumpPrev()"
            >
              <svg class="fill-current h-full" viewBox="4 4 16 16">
                <path :d="mdiMenuUp" />
              </svg>
            </button>
            <button
              class="form-button h-8 m-px inline-flex flex-center"
              :disabled="!next"
              title="下一个（快捷键：↓）"
              @click="jumpNext()"
            >
              <svg class="fill-current h-full" viewBox="4 4 16 16">
                <path :d="mdiMenuDown" />
              </svg>
            </button>
          </template>
        </PresentationViewer>
        <aside
          class="flex-auto bg-gray-900 lg:flex-initial lg:w-1/3 lg:overflow-auto"
        >
          <PresentationSelect
            v-show="value.presentations.length &gt; 0"
            v-model="presentationID"
            class="min-h-16 mb-2"
            :options="value.presentations"
          ></PresentationSelect>
          <CollectionMetadata class="flex-auto lg:mx-1" :value="value">
            <template #recollect-button>
              <button
                class="form-button ml-1"
                type="button"
                :disabled="loadingCount &gt; 0"
                title="收集"
                @click="recollect()"
              >
                <template v-if="loadingCount > 0">
                  <svg
                    class="fill-current inline-block h-6 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <path :d="mdiLoading" />
                  </svg>
                </template>
                <template v-else>
                  <svg
                    class="fill-current h-6 inline-block"
                    viewBox="0 0 24 24"
                  >
                    <path :d="mdiAutorenew" />
                  </svg>
                </template>
              </button>
            </template>
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
import PresentationViewer from '@/components/PresentationViewer.vue';
import mutations from '@/graphql/mutations';
import queries from '@/graphql/queries';
import { info } from '@/message';
import { viewerBackground } from '@/preference';
import * as sentry from '@sentry/browser';
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  ref,
} from '@vue/composition-api';
import { Collection } from '../graphql/types/Collection';
import CollectionMetadata from './CollectionMetadata.vue';
import { icons, setupCommon, setupKeyboardShortcut } from './CollectionViewer';
import Presentation from './Presentation.vue';
import PresentationMetadata from './PresentationMetadata.vue';
import PresentationSelect from './PresentationSelect.vue';

import { mdiLoading } from '@mdi/js';

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
  data() {
    return {
      ...icons,
      mdiLoading,
    };
  },
  setup: (props, ctx) => {
    const value = computed(() => props.value);
    const prev = computed(() => props.prev);
    const next = computed(() => props.next);

    const prevButton = ref<HTMLButtonElement>();
    const nextButton = ref<HTMLButtonElement>();
    const presentationViewer = ref<InstanceType<typeof PresentationViewer>>();
    const {
      jumpNext: _jumpNext,
      jumpPrev: _jumpPrev,
      visible,
      close: _close,
      prefetchURLs,
      presentation,
      presentationID,
    } = setupCommon(ctx, {
      value,
      prev,
      next,
      prevButton,
      nextButton,
    });
    const jumpNext = () => {
      sentry.addBreadcrumb({
        category: 'collection-viewer',
        message: 'jumpNext',
        level: sentry.Severity.Info,
        data: { from: value.value, to: next.value },
      });
      _jumpNext();
    };
    const jumpPrev = () => {
      sentry.addBreadcrumb({
        category: 'collection-viewer',
        message: 'jumpPrev',
        level: sentry.Severity.Info,
        data: { from: value.value, to: prev.value },
      });
      _jumpPrev();
    };
    const close = () => {
      sentry.addBreadcrumb({
        category: 'collection-viewer',
        message: 'close',
        level: sentry.Severity.Info,
        data: { value: value.value },
      });
      _close();
    };

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
      undo: () => {
        presentationViewer?.value?.annotation?.editor.undo();
      },
      redo: () => {
        presentationViewer?.value?.annotation?.editor.redo();
      },
      setPainter: (name) => {
        presentationViewer?.value?.annotation?.setPainter(name);
      },
    });

    const loadingCount = ref(0);

    const refetch = async () => {
      const { data } = await queries.collectionNode({
        id: value.value.id,
      });
      // XXX: value prop is not reactive when using modal.show
      // So we need update manually.
      ctx.emit('update:value', data.node);
    };
    const recollect = async () => {
      sentry.addBreadcrumb({
        category: 'collection-viewer',
        message: 'recollect',
        level: sentry.Severity.Info,
        data: { value: value.value },
      });
      loadingCount.value += 1;
      try {
        const parts = value.value.origin.split(':');
        switch (parts[0]) {
          case 'folder':
            await mutations.collectFromFolder({
              input: { root: parts.slice(1).join(':') },
            });
            break;
          case 'cgteamwork':
            await mutations.collectFromCGTeamwork({
              input: {
                database: parts[1],
                pipeline: parts[2],
                prefix: parts.slice(3).join(':'),
              },
            });
            break;
        }
        await refetch();
        info('更新成功');
      } finally {
        loadingCount.value -= 1;
      }
    };

    onMounted(() => {
      sentry.addBreadcrumb({
        category: 'collection-viewer',
        message: 'open',
        level: sentry.Severity.Info,
        data: { value: value.value },
      });
    });
    return {
      close,
      jumpNext,
      jumpPrev,
      nextButton,
      prefetchURLs,
      prevButton,
      viewerBackground,
      visible,
      presentationViewer,
      recollect,
      refetch,
      loadingCount,
      presentation,
      presentationID,
    };
  },
});
</script>
