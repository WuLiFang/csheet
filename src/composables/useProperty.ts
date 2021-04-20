import {
  getCurrentInstance,
  onUnmounted,
  Ref,
  ref,
  UnwrapRef,
} from '@vue/composition-api';

export function useProperty<T, K extends keyof T>(
  obj: Ref<NonNullable<T>>,
  name: K
): Ref<UnwrapRef<NonNullable<T>[K]>>;
export function useProperty<T, K extends keyof T>(
  obj: Ref<T | undefined>,
  name: K,
  defaultValue: T[K]
): Ref<UnwrapRef<T[K]>>;
export function useProperty<T, K extends keyof T>(
  obj: Ref<T | undefined>,
  name: K,
  defaultValue?: T[K]
): Ref<UnwrapRef<T[K]> | undefined>;
export function useProperty<T, K extends keyof T>(
  obj: Ref<T | undefined>,
  name: K,
  defaultValue?: T[K]
): Ref<UnwrapRef<T[K]> | undefined> {
  const ret = ref(defaultValue);
  let canceled = false;
  const update = () => {
    if (canceled) {
      return;
    }
    requestAnimationFrame(update);
    if (obj.value == null) {
      ret.value = ref(defaultValue).value;
      return;
    }
    ret.value = ref(obj.value[name]).value;
  };
  update();
  if (getCurrentInstance()) {
    onUnmounted(() => {
      canceled = true;
    });
  }

  return ret;
}

export default useProperty;
