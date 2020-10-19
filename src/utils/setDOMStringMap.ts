export default function setDOMStringMap(
  target: DOMStringMap,
  k: string,
  v: string | undefined
): void {
  if (v == null) {
    delete target[k];
  } else {
    target[k] = v;
  }
}
