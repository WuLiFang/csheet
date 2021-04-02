import {
  getCurrentInstance,
  onUnmounted,
  Ref,
  ref,
  watch,
} from '@vue/composition-api';

export default function useElementFullscreen(
  el: Ref<HTMLElement | undefined>
): {
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  isFullscreen: Ref<boolean>;
} {
  const isFullscreen = ref(false);
  const updateFullscreen = () => {
    isFullscreen.value =
      el.value != null && document.fullscreenElement === el.value;
  };
  const requestFullscreen = async () => {
    await el.value?.requestFullscreen();
  };
  const exitFullscreen = async () => {
    if (!isFullscreen) {
      return;
    }
    await document.exitFullscreen();
  };
  const toggleFullscreen = async () => {
    if (isFullscreen.value) {
      await exitFullscreen();
    } else {
      await requestFullscreen();
    }
  };

  const cleanup: (() => void)[] = [];
  const doCleanup = () => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  };

  watch(
    el,
    (n) => {
      doCleanup();
      if (!n) {
        return;
      }
      updateFullscreen();
      n.addEventListener('fullscreenchange', updateFullscreen);
      cleanup.push(() =>
        n.removeEventListener('fullscreenchange', updateFullscreen)
      );
    },
    { immediate: true }
  );

  if (getCurrentInstance()) {
    onUnmounted(doCleanup);
  }

  return {
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isFullscreen,
  };
}
