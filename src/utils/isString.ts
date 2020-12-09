export default function isString(v: unknown): v is string {
  return typeof v === 'string';
}
