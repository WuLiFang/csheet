// TODO: remove this
export default function parseFirstFrame(s: string): number {
  const v = parseInt(s);
  if (!isFinite(v)) {
    return 1;
  }
  return v;
}
