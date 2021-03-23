import addResizeListener from '@/utils/addResizeListener';
import { onUnmounted, Ref, ref, watch } from '@vue/composition-api';
import { debounce } from 'lodash';

export default function useElementSize(
  el: Ref<Element | undefined>
): {
  width: Ref<number>;
  height: Ref<number>;
} {
  const width = ref(0);
  const height = ref(0);

  let stop = (): void => undefined;
  watch(
    el,
    n => {
      stop();
      if (!n) {
        return;
      }
      width.value = n.clientWidth;
      height.value = n.clientHeight;
      stop = addResizeListener(
        n,
        // use debounce to avoid infinite update loop.
        debounce(e => {
          width.value = e.contentRect.width;
          height.value = e.contentRect.height;
        }, 100)
      );
    },
    { immediate: true }
  );

  onUnmounted(() => {
    stop();
  });

  return {
    width,
    height,
  };
}
