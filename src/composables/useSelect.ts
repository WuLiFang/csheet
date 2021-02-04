import { computed, ref, Ref, watch } from '@vue/composition-api';

export default function useSelect<T>(
  values: Ref<T[]>
): {
  selected: Ref<T | undefined>;
  selectedIndex: Ref<number>;
} {
  const selectedIndex = ref(-1);
  const selected = computed({
    get: () => {
      if (selectedIndex.value < 0) {
        return;
      }
      return values.value[selectedIndex.value];
    },
    set: (value: T | undefined) => {
      if (value === undefined) {
        selectedIndex.value = -1;
        return;
      }
      selectedIndex.value = values.value.findIndex(i => i === value);
    },
  });
  watch(selectedIndex, i => {
    if (i < -1) {
      selectedIndex.value = -1;
    }
    if (i > values.value.length - 1) {
      selectedIndex.value = values.value.length - 1;
    }
  });
  return {
    selected,
    selectedIndex,
  };
}
