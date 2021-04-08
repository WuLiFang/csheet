import {
  getCurrentInstance,
  onUnmounted,
  Ref,
  ref,
  watch,
} from '@vue/composition-api';

export default function useNumberChangeRate(
  v: Ref<number>,
  sampleInterval = 100
): Ref<number> {
  const rate = ref(0);
  let lastValue = v.value;
  let lastUpdateTime = Date.now();
  const update = () => {
    const now = Date.now();
    rate.value = ((v.value - lastValue) / (now - lastUpdateTime)) * 1000;
    lastValue = v.value;
    lastUpdateTime = now;
  };

  let timeoutId: number | undefined;
  const cancelPendingUpdate = (): void => window.clearTimeout(timeoutId);
  watch(v, () => {
    update();
    cancelPendingUpdate();
    timeoutId = window.setTimeout(update, sampleInterval);
  });

  if (getCurrentInstance()) {
    onUnmounted(cancelPendingUpdate);
  }
  return rate;
}
