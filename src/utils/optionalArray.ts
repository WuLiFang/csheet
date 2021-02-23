export default function optionalArray<T>(v: T[] | undefined): T[] | undefined {
  if (v == null || v.length === 0) {
    return;
  }
  return v;
}
