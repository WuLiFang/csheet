import {
  customRef,
  getCurrentInstance,
  onUnmounted,
  Ref,
} from '@vue/composition-api';

export default function useLocation(): Readonly<Ref<Location>> {
  return customRef((track, trigger) => {
    addEventListener('popstate', trigger);
    addEventListener('hashchange', trigger);
    if (getCurrentInstance()) {
      onUnmounted(() => {
        removeEventListener('popstate', trigger);
        removeEventListener('hashchange', trigger);
      });
    }
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
