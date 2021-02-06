import { Presentation } from '@/graphql/queries/presentationNode';
import parseFrameRate from '@/utils/parseFrameRate';
import { ref, Ref, watch } from '@vue/composition-api';

export default function usePresentationMetadata(
  p: Ref<Presentation | undefined>
): {
  annotation: Ref<string>;
  duration: Ref<number>;
  firstFrame: Ref<number>;
  frameCount: Ref<number>;
  frameRate: Ref<number>;
  height: Ref<number>;
  lastFrame: Ref<number>;
  pixelFormat: Ref<string>;
  width: Ref<number>;
} {
  const annotation = ref('');
  const duration = ref(0);
  const firstFrame = ref(0);
  const frameCount = ref(0);
  const frameRate = ref(0);
  const height = ref(0);
  const lastFrame = ref(0);
  const pixelFormat = ref('');
  const width = ref(0);

  watch(
    () => p.value?.metadata ?? [],
    n => {
      annotation.value = '';
      firstFrame.value = NaN;
      frameCount.value = 0;
      frameRate.value = 0;
      height.value = 1080;
      lastFrame.value = NaN;
      pixelFormat.value = '';
      width.value = 1920;
      for (const i of n) {
        switch (i.k) {
          case 'annotation':
            annotation.value = i.v;
            break;
          case 'height':
            height.value = parseFloat(i.v) || height.value;
            break;
          case 'width':
            width.value = parseFloat(i.v) || width.value;
            break;
          case 'frame-count':
            frameCount.value = parseFloat(i.v) || frameCount.value;
            break;
          case 'frame-rate':
            frameRate.value = parseFrameRate(i.v);
            break;
          case 'first-frame':
            firstFrame.value = parseInt(i.v);
            break;
          case 'last-frame':
            lastFrame.value = parseInt(i.v);
            break;
          case 'pixel-format':
            pixelFormat.value = i.v;
            break;
        }
      }
      if (!isFinite(firstFrame.value)) {
        firstFrame.value = 1;
      }
      if (!isFinite(lastFrame.value)) {
        lastFrame.value = firstFrame.value + frameCount.value;
      }
    },
    { deep: true, immediate: true }
  );

  return {
    annotation,
    duration,
    firstFrame,
    frameCount,
    frameRate,
    height,
    lastFrame,
    pixelFormat,
    width,
  };
}
