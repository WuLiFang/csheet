/** should not modify collection while iterating */
export default function* iterateHTMLCollection(
  collection: HTMLCollectionBase,
  reverse = false
): IterableIterator<Element> {
  for (
    let i = reverse ? collection.length - 1 : 0;
    reverse ? i >= 0 : i < collection.length;
    reverse ? (i -= 1) : (i += 1)
  ) {
    const el = collection.item(i);
    if (!el) {
      continue;
    }
    yield el;
  }
}
