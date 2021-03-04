import { computed, Ref } from '@vue/composition-api';
import { debounce, DebounceSettings } from 'lodash';

export default function useDebounced<T>(
  value: Ref<T>,
  wait?: number,
  options?: DebounceSettings
): Ref<T> {
  return computed({
    get() {
      return value.value;
    },
    set: debounce(
      (v: T) => {
        value.value = v;
      },
      wait,
      options
    ),
  });
}
