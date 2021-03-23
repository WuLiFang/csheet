<template>
  <div>
    <PresentationAnnotationEditorToolbar
      v-if="annotation"
      v-show="id"
      :parent="annotation"
    >
      <template #right>
        <button
          class="form-button h-8 m-px inline-flex flex-center"
          type="button"
          title="保存截图"
          @click="saveScreenshot()"
        >
          <FaIcon name="camera"></FaIcon>
        </button>
      </template>
    </PresentationAnnotationEditorToolbar>
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
          autoplay="autoplay"
          :controls="annotation && annotation.currentPainter === 'null'"
          :playback-rate="playbackRate"
          @frameUpdate="currentFrame = $event"
          @timeUpdate="currentTime = $event"
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
        :frame="currentFrame"
        :painter.sync="preferredPainter"
        @draw-start="presentation.pause()"
      ></PresentationAnnotationEditor>
    </div>
    <PresentationControls
      v-if="node && node.type === 'video'"
      ref="controls"
      class="flex flex-col sm:flex-row overflow-x-hidden flex-wrap justify-center items-center z-0"
      :parent="presentation"
      :playback-rate.sync="playbackRate"
    ></PresentationControls>
  </div>
</template>

<script lang="ts">
import useElementSize from '@/composables/useElementSize';
import useObjectContainRate from '@/composables/useObjectContainRate';
import usePresentationMetadata from '@/composables/usePresentationMetadata';
import db from '@/db';
import { usePresentationNode } from '@/graphql/queries/index.queries';
import { computed, defineComponent, ref } from '@vue/composition-api';
import { saveAs } from 'file-saver';
import { basename, extname } from 'path';
import Presentation from './Presentation.vue';
import PresentationAnnotationEditor from './PresentationAnnotationEditor.vue';
import PresentationAnnotationEditorToolbar from './PresentationAnnotationEditorToolbar.vue';
import PresentationControls from './PresentationControls.vue';

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
  setup: props => {
    const { node } = usePresentationNode(
      computed(() => ({ id: props.id ?? '' })),
      computed(() => ({ skip: !props.id }))
    );
    const viewport = ref<HTMLDivElement | undefined>();
    const presentation = ref<Presentation | undefined>();
    const annotation = ref<PresentationAnnotationEditor | undefined>();
    const controls = ref<PresentationControls | undefined>();

    const screenshot = async (
      type = 'image/jpeg',
      quality = 1
    ): Promise<Blob | null> => {
      if (!presentation.value) {
        return null;
      }
      const bg = presentation.value.$el;
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
      if (annotation.value && annotation.value.painter !== 'null') {
        const el = annotation.value.$el;
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
    };

    const saveScreenshot = async (): Promise<void> => {
      const data = await screenshot('image/jpeg');
      if (!data) {
        return;
      }
      const name = node.value
        ? basename(node.value.raw.path, extname(node.value.raw.path))
        : 'screenshot';
      saveAs(
        data,
        node.value?.type === 'video'
          ? `${name}.${presentation.value?.currentFrame}.jpg`
          : `${name}.jpg`
      );
    };

    const backgroundClass = computed(() => {
      switch (db.preference.get('viewerBackground')) {
        case 'checkboard':
          return 'bg-checkboard';
        case 'checkboard-sm':
          return 'bg-checkboard-sm';
        case 'white':
          return 'bg-white';
        default:
          return 'bg-black';
      }
    });

    const preferredPainter = computed({
      get() {
        return db.preference.get('viewerAnnotationPainter');
      },
      set(v: string) {
        db.preference.set('viewerAnnotationPainter', v);
      },
    });

    const currentFrame = ref(0);
    const playbackRate = ref(1);

    const { width: viewportWidth, height: viewportHeight } = useElementSize(
      viewport
    );
    const { width, height } = usePresentationMetadata(node);

    const viewportObjectContainRate = useObjectContainRate(
      viewportWidth,
      viewportHeight,
      width,
      height
    );

    const presentationClass = computed(() => {
      if (!node.value || viewportObjectContainRate.value > 0.382) {
        return 'object-contain w-full h-full';
      } else if (width.value > height.value) {
        return 'object-cover h-full max-w-none';
      } else {
        return 'object-cover w-full max-h-none';
      }
    });

    return {
      node,
      viewport,
      presentation,
      annotation,
      controls,
      screenshot,
      saveScreenshot,
      backgroundClass,
      currentFrame,
      preferredPainter,
      playbackRate,
      presentationClass,
    };
  },
});
</script>
