import { ref, Ref, nextTick } from '@vue/composition-api';

export default function useDelayedBlur({
  delay = 100,
  onDelayedBlur,
  onDelayedFocus,
}: {
  delay?: number;
  onDelayedBlur?: () => void;
  onDelayedFocus?: () => void;
} = {}): {
  hasFocus: Ref<boolean>;
  blur: () => void;
  focus: () => void;
} {
  const hasFocus = ref(false);
  return {
    hasFocus,
    blur: () => {
      if (!hasFocus.value) {
        return;
      }
      hasFocus.value = false;
      setTimeout(() => {
        if (hasFocus.value) {
          return;
        }
        onDelayedBlur?.();
      }, delay);
    },
    focus: () => {
      if (hasFocus.value) {
        return;
      }
      hasFocus.value = true;
      nextTick(() => {
        if (!hasFocus.value) {
          return;
        }
        onDelayedFocus?.();
      });
    },
  };
}
