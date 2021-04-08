import { Ref, watch } from '@vue/composition-api';
import { Observable } from 'rxjs';

export default function observableFromRef<T>(
  v: Ref<T>,
  deep = false
): Observable<T> {
  return new Observable((sub) => {
    watch(v, (v) => sub.next(v), { deep, immediate: true });
  });
}
