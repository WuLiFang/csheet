import useCleanup from '@/composables/useCleanup';
import addResizeListener from '@/utils/addResizeListener';
import { Ref, ref, watch } from '@vue/composition-api';
import { debounce } from 'lodash';

export default function useElementSize(
  el: Ref<Element | undefined>
): {
  width: Ref<number>;
  height: Ref<number>;
} {
  const { addCleanup, cleanup } = useCleanup();

  const height = ref(0);
  const width = ref(0);
  watch(
    el,
    (n) => {
      cleanup();
      if (!n) {
        return;
      }
      width.value = n.clientWidth;
      height.value = n.clientHeight;
      const stop = addResizeListener(
        n,
        // use debounce to avoid infinite update loop.
        debounce((e) => {
          width.value = e.contentRect.width;
          height.value = e.contentRect.height;
        }, 100)
      );
      addCleanup(stop);
    },
    { immediate: true }
  );

  return {
    width,
    height,
  };
}
