import useCleanup from '@/composables/useCleanup';
import { Ref, ref, watch } from '@vue/composition-api';
import { clamp } from 'lodash';
import cast from 'cast-unknown';

export default function useFrameControl({
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
  paused: Ref<boolean>;
  play: () => void;
  pause: () => void;
  seek: (time: number, pause?: boolean) => void;
  seekFrame: (frame: number, pause?: boolean) => void;
  seekFrameOffset: (frame: number, pause?: boolean) => void;
} {
  const { addCleanup, cleanup } = useCleanup();

  const paused = ref(false);

  const updatePaused = () => {
    if (el.value instanceof HTMLVideoElement) {
      paused.value = el.value.paused;
    } else {
      paused.value = true;
    }
  };
  watch(
    el,
    (el) => {
      cleanup();
      updatePaused();
      if (el instanceof HTMLVideoElement) {
        el.addEventListener('play', updatePaused);
        el.addEventListener('pause', updatePaused);
        addCleanup(() => {
          el.removeEventListener('play', updatePaused);
          el.removeEventListener('pause', updatePaused);
        });
      }
    },
    { immediate: true }
  );

  const play = () => {
    if (el.value instanceof HTMLVideoElement) {
      cast
        .promise(el.value.play())()
        .catch((err) => {
          if (String(err).startsWith('AbortError:')) {
            return;
          }
          throw err;
        });
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
    paused,
    play,
    pause,
    seek,
    seekFrame,
    seekFrameOffset,
  };
}
