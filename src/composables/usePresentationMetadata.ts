import { Presentation } from '@/graphql/queries/presentationNode';
import parseFrameRate from '@/utils/parseFrameRate';
import { computed, ref, Ref, watch } from '@vue/composition-api';

export default function usePresentationMetadata(
  p: Ref<Presentation | undefined>
): {
  annotation: Ref<string>;
  duration: Ref<number>;
  firstFrame: Ref<number>;
  frameCount: Ref<number>;
  frameRate: Ref<number>;
  frameRateText: Ref<string>;
  height: Ref<number>;
  lastFrame: Ref<number>;
  pixelFormat: Ref<string>;
  width: Ref<number>;
  // extra metadata that not defined in docs.
  extra: Ref<Record<string, string>>;
} {
  const annotation = ref('');
  const duration = ref(0);
  const firstFrame = ref(0);
  const frameCount = ref(0);
  const frameRateText = ref('');
  const frameRate = computed(() => {
    if (!frameRateText.value) {
      return 0;
    }
    return parseFrameRate(frameRateText.value);
  });
  const height = ref(0);
  const lastFrame = ref(0);
  const pixelFormat = ref('');
  const width = ref(0);
  const extra = ref<Record<string, string>>({});

  watch(
    () => p.value?.metadata ?? [],
    (n) => {
      annotation.value = '';
      firstFrame.value = NaN;
      frameCount.value = 0;
      height.value = 1080;
      lastFrame.value = NaN;
      pixelFormat.value = '';
      width.value = 1920;
      extra.value = {};
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
          case 'duration':
            duration.value = parseFloat(i.v) || duration.value;
            break;
          case 'frame-count':
            frameCount.value = parseFloat(i.v) || frameCount.value;
            break;
          case 'frame-rate':
            frameRateText.value = i.v;
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
          default:
            extra.value[i.k] = i.v;
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
    frameRateText,
    height,
    lastFrame,
    pixelFormat,
    width,
    extra,
  };
}
