export default function isNonNull<T>(
  v: T
): v is T extends null | undefined ? never : T {
  return v != null;
}
