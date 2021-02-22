export default function optionalArray<T>(v: T[]): T[] | undefined {
  if (v.length === 0) {
    return;
  }
  return v;
}
