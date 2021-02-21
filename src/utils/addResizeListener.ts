import { ResizeObserver, ResizeObserverEntry } from '@juggle/resize-observer';

export default function addResizeListener(
  el: Element,
  fn: (entry: ResizeObserverEntry) => void
): () => void {
  const ob = new ResizeObserver((entries): void => {
    for (const i of entries) {
      fn(i);
    }
  });

  ob.observe(el);
  return (): void => ob.unobserve(el);
}
