export default function relativeURL(from: string, to = '/'): string {
  if (from.startsWith(to)) {
    return from.slice(to.length);
  }
  return from;
}
