<template>
  <div ref="el">
    <div v-show="id || isFullscreen" class="flex flex-center flex-wrap">
      <PresentationAnnotationEditorToolbar
        v-if="annotation"
        class="flex-auto"
        :class="{
          invisible: !id,
        }"
        :parent="annotation"
      >
      </PresentationAnnotationEditorToolbar>
      <div>
        <button
          class="form-button h-8 w-12 px-0 m-px inline-flex flex-center"
          type="button"
          title="保存截图"
          @click="saveScreenshot()"
        >
          <FaIcon name="camera"></FaIcon>
        </button>
        <slot v-if="isFullscreen" name="fullscreenToolbar"> </slot>
        <button
          class="form-button h-8 w-12 px-0 m-px inline-flex flex-center"
          type="button"
          title="全屏"
          @click="toggleFullscreen()"
        >
          <FaIcon :name="isFullscreen ? 'compress' : 'expand'"></FaIcon>
        </button>
      </div>
    </div>
    <p v-if="node && node.isRegularTranscodeFailed" class="bg-red-500 w-full">
      预览转码失败，重新收集以重试
    </p>
    <p v-else-if="node && node.isRegularOutdated" class="bg-orange-500 w-full">
      预览已过期
    </p>
    <div
      ref="viewport"
      class="relative text-center flex-auto z-10 overflow-auto"
      :class="{ [backgroundClass]: true }"
    >
      <transition
        enter-class="opacity-0"
        leave-to-class="opacity-0"
        enter-active-class="transition-all duration-500 ease-in"
        leave-active-class="transition-all duration-500 ease-out"
      >
        <Presentation
          :id="id"
          ref="presentation"
          :key="id"
          :class="presentationClass"
          class="absolute inset-0"
          size="regular"
          autoplay
          draggable
          :controls="annotation && annotation.currentPainter === 'null'"
          :playback-rate="playbackRate"
        ></Presentation>
      </transition>
      <Presentation
        :id="id"
        class="object-contain w-full h-full invisible lg:hidden"
        size="thumb"
      ></Presentation>
      <PresentationAnnotationEditor
        :id="id"
        ref="annotation"
        :class="presentationClass"
        class="absolute inset-0"
        :painter.sync="preferredPainter"
        @draw-start="controls && controls.pause()"
      ></PresentationAnnotationEditor>
    </div>
    <PresentationControls
      v-if="presentation && node && node.type === 'video'"
      ref="controls"
      class="flex flex-col sm:flex-row overflow-x-hidden flex-wrap justify-center items-center z-0"
      :parent="presentation"
      :playback-rate.sync="playbackRate"
    ></PresentationControls>
  </div>
</template>

<script lang="ts">
import useElementFullscreen from '@/composables/useElementFullscreen';
import { usePresentationNode } from '@/graphql/queries/index.queries';
import { viewerAnnotationPainter } from '@/preference';
import * as sentry from '@sentry/browser';
import {
  computed,
  defineComponent,
  ref,
  watchEffect,
} from '@vue/composition-api';
import 'vue-awesome/icons/camera';
import 'vue-awesome/icons/compress';
import 'vue-awesome/icons/expand';
import Presentation from './Presentation.vue';
import PresentationAnnotationEditor from './PresentationAnnotationEditor.vue';
import PresentationAnnotationEditorToolbar from './PresentationAnnotationEditorToolbar.vue';
import PresentationControls from './PresentationControls.vue';
import { setupCommon } from './PresentationViewer';

export default defineComponent({
  name: 'PresentationViewer',
  props: {
    id: {
      type: String,
    },
  },
  components: {
    Presentation,
    PresentationAnnotationEditorToolbar,
    PresentationAnnotationEditor,
    PresentationControls,
  },
  setup: (props) => {
    const { node } = usePresentationNode(
      computed(() => ({ id: props.id ?? '' })),
      computed(() => ({ skip: !props.id }))
    );

    watchEffect(() => {
      sentry.addBreadcrumb({
        category: 'presentation-viewer',
        message: 'load',
        level: sentry.Severity.Info,
        data: { value: node.value },
      });
    });
    const el = ref<HTMLDivElement>();
    const viewport = ref<HTMLDivElement | undefined>();
    const presentation = ref<Presentation | undefined>();
    const annotation = ref<PresentationAnnotationEditor | undefined>();
    const controls = ref<
      InstanceType<typeof PresentationControls> | undefined
    >();

    const preferredPainter = viewerAnnotationPainter;

    const currentFrame = computed(() => controls.value?.currentFrameProxy ?? 0);
    const playbackRate = ref(1);

    const { toggleFullscreen, isFullscreen } = useElementFullscreen(el);
    const {
      backgroundClass,
      presentationClass,
      screenshot,
      saveScreenshot,
    } = setupCommon(
      node,
      viewport,
      computed(() => presentation.value?.$el),
      computed(() => annotation.value?.$el),
      computed(() => annotation.value?.painter !== 'null'),
      currentFrame
    );

    return {
      el,
      node,
      viewport,
      presentation,
      annotation,
      controls,
      screenshot,
      saveScreenshot,
      backgroundClass,
      preferredPainter,
      playbackRate,
      presentationClass,
      isFullscreen,
      toggleFullscreen,
    };
  },
});
</script>
