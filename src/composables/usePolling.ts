import { Ref, UnwrapRef, ref } from '@vue/composition-api';
import useCleanup from '@/composables/useCleanup';

/**
 * @returns polling stop function
 */
export default function usePolling<T>(
  v: Ref<UnwrapRef<T>>,
  update: () => Promise<T> | T,
  scheduleNext: (update: () => void) => void = requestAnimationFrame
): () => void {
  const { addCleanup } = useCleanup();
  let isStopped = false;

  const stop = () => {
    isStopped = true;
  };
  addCleanup(stop);

  const run = async () => {
    if (isStopped) {
      return;
    }
    v.value = ref(await update()).value;
    scheduleNext(run);
  };
  run();

  return stop;
}
