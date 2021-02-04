import { nextTick, ref, Ref, watch } from '@vue/composition-api';
import cast from 'cast-unknown';

function useNormalizedValues<T, TNull>(opts: {
  value: Ref<T | T[] | TNull>;
  multiple?: Ref<boolean>;
  nullValue?: Ref<TNull>;
}): {
  values: Ref<T[]>;
  addValue: (v: T) => void;
};
function useNormalizedValues<T>(opts: {
  value: Ref<T | T[] | undefined>;
  multiple?: Ref<boolean>;
}): {
  values: Ref<T[]>;
  addValue: (v: T) => void;
};
function useNormalizedValues<T, TNull>({
  value,
  multiple = ref(false),
  nullValue = ref(),
}: {
  value: Ref<T | T[] | TNull | undefined>;
  multiple?: Ref<boolean>;
  nullValue?: Ref<TNull | undefined>;
}): {
  values: Ref<T[]>;
  addValue: (v: T) => void;
} {
  const values = ref([]) as Ref<T[]>;
  let skipWatch = false;
  watch(
    value,
    v => {
      skipWatch = true;
      values.value = cast.array(v).filter(i => i !== nullValue.value) as T[];
      nextTick(() => {
        skipWatch = false;
      });
    },
    { immediate: true }
  );
  watch(values, v => {
    if (skipWatch) {
      return;
    }
    if (multiple.value) {
      value.value = v;
    } else {
      value.value = v[0] ?? nullValue.value;
    }
  });

  return {
    values,
    addValue: v => {
      if (multiple.value) {
        values.value.push(v);
      } else {
        values.value = [v];
      }
    },
  };
}

export default useNormalizedValues;
