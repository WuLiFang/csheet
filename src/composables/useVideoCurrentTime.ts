import {
  getCurrentInstance,
  onUnmounted,
  Ref,
  ref,
} from '@vue/composition-api';

export default function useVideoCurrentTime(
  el: Ref<HTMLVideoElement | undefined>
): Ref<number> {
  const ret = ref(0);
  let canceled = false;
  const update = () => {
    if (canceled) {
      return;
    }
    if (el.value instanceof HTMLVideoElement) {
      ret.value = el.value.currentTime;
    } else {
      ret.value = 0;
    }
    requestAnimationFrame(update);
  };
  update();
  if (getCurrentInstance()) {
    onUnmounted(() => {
      canceled = true;
    });
  }

  return ret;
}
