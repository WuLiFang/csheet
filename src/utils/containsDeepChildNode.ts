export default function containsDeepChildNode(
  container: ParentNode,
  v: Node
): boolean {
  let c = v.parentNode;
  while (c) {
    if (c === container) {
      return true;
    }
    c = c.parentNode;
  }
  return false;
}
