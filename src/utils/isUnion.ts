export default function isUnion<T>(
  v: unknown,
  ...typeGuards: ((v: unknown) => v is T)[]
): v is T {
  for (const i of typeGuards) {
    if (i(v)) {
      return true;
    }
  }
  return false;
}
