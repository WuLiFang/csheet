import useCleanup from '@/composables/useCleanup';
import { customRef, Ref } from '@vue/composition-api';

export default function useLocation(): Readonly<Ref<Location>> {
  const { addCleanup } = useCleanup();
  return customRef((track, trigger) => {
    addEventListener('popstate', trigger);
    addEventListener('hashchange', trigger);
    addCleanup(() => {
      removeEventListener('popstate', trigger);
      removeEventListener('hashchange', trigger);
    });
    return {
      get() {
        track();
        return location;
      },
      set() {
        // readonly
      },
    };
  });
}
