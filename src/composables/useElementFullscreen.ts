import useCleanup from '@/composables/useCleanup';
import { Ref, ref, watch } from '@vue/composition-api';

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

  const { cleanup, addCleanup } = useCleanup();

  watch(
    el,
    (n) => {
      cleanup();
      if (!n) {
        return;
      }
      updateFullscreen();
      n.addEventListener('fullscreenchange', updateFullscreen);
      addCleanup(() =>
        n.removeEventListener('fullscreenchange', updateFullscreen)
      );
    },
    { immediate: true }
  );

  return {
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isFullscreen,
  };
}
