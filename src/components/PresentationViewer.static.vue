<template>
  <div ref="el">
    <div v-show="node || isFullscreen" class="flex items-center">
      <PresentationAnnotationEditorToolbar
        v-if="annotation"
        class="flex-auto"
        :class="{
          invisible: !node,
        }"
        :parent="annotation"
      >
      </PresentationAnnotationEditorToolbar>
      <button
        v-if="supportsScreenshot"
        class="form-button h-8 m-px inline-flex flex-center"
        type="button"
        title="保存截图"
        @click="saveScreenshot()"
      >
        <FaIcon name="camera"></FaIcon>
      </button>
      <slot v-if="isFullscreen" name="fullscreenToolbar"> </slot>
      <button
        class="form-button h-8 m-px inline-flex flex-center"
        type="button"
        title="全屏"
        @click="toggleFullscreen()"
      >
        <FaIcon :name="isFullscreen ? 'compress' : 'expand'"></FaIcon>
      </button>
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
          ref="presentation"
          :key="value && value.id"
          :value="value"
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
        :value="value"
        class="object-contain w-full h-full invisible lg:hidden"
        size="thumb"
      ></Presentation>
      <PresentationAnnotationEditor
        v-show="isAnnotationVisible"
        ref="annotation"
        :value="value"
        :class="presentationClass"
        class="absolute inset-0"
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
import { setupCommon } from '@/components/PresentationViewer';
import useElementFullscreen from '@/composables/useElementFullscreen';
import { Presentation } from '@/graphql/types/Presentation';
import { isPresentationAnnotationVisible } from '@/preference';
import { computed, defineComponent, PropType, ref } from '@vue/composition-api';
import 'vue-awesome/icons/camera';
import 'vue-awesome/icons/compress';
import 'vue-awesome/icons/expand';
import PresentationVue from './Presentation.static.vue';
import PresentationAnnotationEditor from './PresentationAnnotationEditor.static.vue';
import PresentationAnnotationEditorToolbar from './PresentationAnnotationEditorToolbar.static.vue';
import PresentationControls from './PresentationControls.vue';

export default defineComponent({
  name: 'PresentationViewer',
  props: {
    value: {
      type: Object as PropType<Presentation>,
    },
  },
  components: {
    Presentation: PresentationVue,
    PresentationAnnotationEditorToolbar,
    PresentationAnnotationEditor,
    PresentationControls,
  },
  setup: (props, ctx) => {
    const el = ref<HTMLElement>();
    const node = computed(() => props.value);
    const viewport = ref<HTMLDivElement | undefined>();
    const presentation = ref<PresentationVue | undefined>();
    const annotation = ref<
      InstanceType<typeof PresentationAnnotationEditor> | undefined
    >();
    const controls = ref<
      InstanceType<typeof PresentationControls> | undefined
    >();
    const supportsScreenshot = location.protocol !== 'file:';

    const currentFrame = computed(() => controls.value?.currentFrameProxy ?? 0);
    const playbackRate = ref(1);

    const { toggleFullscreen, isFullscreen } = useElementFullscreen(el);

    const {
      backgroundClass,
      presentationClass,
      screenshot,
      saveScreenshot,
    } = setupCommon(
      ctx,
      node,
      viewport,
      computed(() => presentation.value?.$el),
      computed(() => annotation.value?.el),
      isPresentationAnnotationVisible,
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
      playbackRate,
      presentationClass,
      isAnnotationVisible: isPresentationAnnotationVisible,
      supportsScreenshot,
      isFullscreen,
      toggleFullscreen,
    };
  },
});
</script>
