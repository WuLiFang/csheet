export default function isNonNull<T>(v: T): v is NonNullable<T> {
  return v != null;
}
