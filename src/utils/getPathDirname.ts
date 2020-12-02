export default function getPathDirname(v: string): string {
  const parts = v.split('/');
  return parts.slice(0, parts.length - 1).join('/');
}
