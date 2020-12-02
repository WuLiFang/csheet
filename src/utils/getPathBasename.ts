export default function getPathBasename(v: string): string {
  const parts = v.split('/');
  return parts[parts.length - 1];
}
