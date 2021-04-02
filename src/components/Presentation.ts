import { Presentation } from '@/graphql/types/Presentation';
import clamp from '@/utils/clamp';
import { computed, ComputedRef, Ref } from '@vue/composition-api';

export function useCurrentFrame({
  firstFrame,
  currentTime,
  frameRate,
}: {
  firstFrame: Ref<number>;
  currentTime: Ref<number>;
  frameRate: Ref<number>;
}): ComputedRef<number> {
  return computed(() => {
    return firstFrame.value + Math.round(currentTime.value * frameRate.value);
  });
}

export function useFrameControl({
  el,
  firstFrame,
  currentFrame,
  frameRate,
}: {
  el: Ref<HTMLElement | undefined>;
  firstFrame: Ref<number>;
  currentFrame: Ref<number>;
  frameRate: Ref<number>;
}): {
  play: () => void;
  pause: () => void;
  seek: (time: number, pause?: boolean) => void;
  seekFrame: (frame: number, pause?: boolean) => void;
  seekFrameOffset: (frame: number, pause?: boolean) => void;
} {
  const play = () => {
    if (el.value instanceof HTMLVideoElement) {
      el.value.play();
    }
  };
  const pause = () => {
    if (el.value instanceof HTMLVideoElement) {
      el.value.pause();
    }
  };
  const seek = (time: number, isPause = false): void => {
    if (!isFinite(time)) {
      return;
    }
    if (isPause) {
      pause();
    }
    if (el.value instanceof HTMLVideoElement) {
      // time out of range has different behavior on different browser
      el.value.currentTime = clamp(
        time,
        0,
        // subtract 0.001 second to avoid outrange on firefox
        el.value.duration - 0.001
      );
    }
  };
  const seekFrame = (f: number, pause = false): void => {
    if (frameRate.value <= 0) {
      return;
    }
    seek(
      // add 0.001 frame to avoid display previous frame for encoded video
      (f - firstFrame.value + 0.001) / frameRate.value,
      pause
    );
  };

  const seekFrameOffset = (offset: number, pause = false): void => {
    seekFrame(currentFrame.value + offset, pause);
  };
  return {
    play,
    pause,
    seek,
    seekFrame,
    seekFrameOffset,
  };
}

export function usePresentationFile(
  presentation: Ref<Presentation | undefined>,
  {
    size,
    isLoadFailed,
    isLoading,
    retryCount,
  }: {
    size: Ref<string>;
    isLoading?: Ref<boolean>;
    isLoadFailed: Ref<boolean>;
    retryCount?: Ref<number>;
  }
): {
  url: Ref<string | undefined>;
  isTranscodeFailed: Ref<boolean>;
  isTranscoding: Ref<boolean>;
  src: Ref<string>;
} {
  const ret = computed(() => {
    switch (size.value) {
      case 'regular':
        return {
          url: presentation.value?.regular?.url,
          isNeedTranscode:
            presentation.value != null && presentation.value.regular == null,
          isTranscodeFailed:
            presentation.value?.isRegularTranscodeFailed ?? false,
        };
      case 'thumb':
      default:
        return {
          url: presentation.value?.thumb?.url,
          isNeedTranscode:
            presentation.value != null && presentation.value.thumb == null,
          isTranscodeFailed:
            presentation.value?.isThumbTranscodeFailed ?? false,
        };
    }
  });

  const url = computed(() => ret.value.url);
  const isTranscodeFailed = computed(() => ret.value.isTranscodeFailed);
  const isTranscoding = computed(
    () => ret.value.isNeedTranscode && !isTranscodeFailed.value
  );
  const src = computed((): string => {
    if (isTranscoding?.value) {
      return require('@/assets/img/transcoding.svg');
    }
    if (isLoading?.value) {
      return require('@/assets/img/loading.svg');
    }
    if (isTranscodeFailed.value) {
      return require('@/assets/img/transcode_failed.svg');
    }
    if (isLoadFailed.value) {
      return require('@/assets/img/load_failed.svg');
    }
    if (!url.value) {
      return require('@/assets/img/default.svg');
    }
    if ((retryCount?.value ?? 0) > 0) {
      return url.value + `?t=${Date.now()}`;
    }
    return url.value;
  });

  return {
    url,
    isTranscodeFailed,
    isTranscoding,
    src,
  };
}

export function usePresentationDrag(
  presentation: Ref<Presentation | undefined>
) {
  return (e: DragEvent): void => {
    if (!presentation.value) {
      return;
    }
    e.dataTransfer?.setData('text/plain', presentation.value.raw.path);
  };
}
