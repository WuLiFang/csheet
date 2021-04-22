import useCleanup from '@/composables/useCleanup';
import { Ref, ref, watch } from '@vue/composition-api';

export default function useNumberChangeRate(
  v: Ref<number>,
  sampleInterval = 100
): Ref<number> {
  const { addCleanup, cleanup } = useCleanup();

  const rate = ref(0);
  let lastValue = v.value;
  let lastUpdateTime = Date.now();
  const update = () => {
    const now = Date.now();
    rate.value = ((v.value - lastValue) / (now - lastUpdateTime)) * 1000;
    lastValue = v.value;
    lastUpdateTime = now;
  };

  watch(v, () => {
    cleanup();
    update();
    const timeoutId = setTimeout(update, sampleInterval);
    addCleanup(() => clearTimeout(timeoutId));
  });

  return rate;
}
