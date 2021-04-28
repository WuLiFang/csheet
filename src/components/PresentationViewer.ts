import useCleanup from '@/composables/useCleanup';
import useElementSize from '@/composables/useElementSize';
import useObjectContainRate from '@/composables/useObjectContainRate';
import usePresentationMetadata from '@/composables/usePresentationMetadata';
import { Presentation } from '@/graphql/types/Presentation';
import { viewerBackground } from '@/preference';
import isNonNull from '@/utils/isNonNull';
import screenshotElements from '@/utils/screenshotElements';
import { mdiCamera, mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import { computed, Ref, SetupContext } from '@vue/composition-api';
import { saveAs } from 'file-saver';
import { basename, extname } from 'path';

export const icons = {
  mdiCamera,
  mdiFullscreen,
  mdiFullscreenExit,
};
const backgroundClass = computed(() => {
  switch (viewerBackground.value) {
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

export function setupCommon(
  ctx: SetupContext,
  presentation: Ref<Presentation | undefined>,
  viewport: Ref<HTMLDivElement | undefined>,
  media: Ref<HTMLVideoElement | HTMLImageElement | undefined>,
  annotationSVG: Ref<SVGSVGElement | undefined>,
  annotationVisible: Ref<boolean>,
  currentFrame: Ref<number>
): {
  backgroundClass: Ref<string>;
  presentationClass: Ref<string>;
  screenshot: (type?: string, quality?: number) => Promise<Blob | null>;
  saveScreenshot: () => Promise<void>;
} {
  const { width: viewportWidth, height: viewportHeight } = useElementSize(
    viewport
  );
  const { width, height } = usePresentationMetadata(presentation);
  const viewportObjectContainRate = useObjectContainRate(
    viewportWidth,
    viewportHeight,
    width,
    height
  );
  const presentationClass = computed(() => {
    if (!presentation.value || viewportObjectContainRate.value > 0.382) {
      return 'object-contain w-full h-full';
    } else if (width.value > height.value) {
      return 'object-cover h-full w-auto max-w-none';
    } else {
      return 'object-cover w-full w-auto max-h-none';
    }
  });

  const screenshot = async (
    type = 'image/jpeg',
    quality = 1
  ): Promise<Blob | null> => {
    return screenshotElements(
      [
        media.value,
        ...(annotationVisible.value ? [annotationSVG.value] : []),
      ].filter(isNonNull),
      type,
      quality
    );
  };

  const saveScreenshot = async (): Promise<void> => {
    const data = await screenshot('image/jpeg');
    if (!data) {
      return;
    }
    const name = presentation.value
      ? basename(
          presentation.value.raw.path,
          extname(presentation.value.raw.path)
        )
      : 'screenshot';
    saveAs(
      data,
      presentation.value?.type === 'video'
        ? `${name}.${currentFrame.value}.jpg`
        : `${name}.jpg`
    );
  };

  const { addCleanup } = useCleanup();
  const screenshotListener = async (cb: (v: Blob) => void) => {
    const data = await screenshot();
    if (data) {
      cb(data);
    }
  };
  ctx.root.$on('viewer-screenshot', screenshotListener);
  addCleanup(() => ctx.root.$off('viewer-screenshot', screenshotListener));

  return { presentationClass, backgroundClass, screenshot, saveScreenshot };
}
