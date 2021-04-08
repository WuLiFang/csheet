import { onUnmounted, ref, Ref, UnwrapRef } from '@vue/composition-api';
import { Observable } from 'rxjs';

export default function useObservable<T>(
  v: Observable<UnwrapRef<T>>,
  initialValue: T
): Ref<UnwrapRef<T>> {
  const ret = ref<T>(initialValue);
  const sub = v.subscribe((i) => {
    ret.value = i;
  });
  onUnmounted(() => {
    sub.unsubscribe();
  });
  return ret;
}
