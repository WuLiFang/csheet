export default function parseOptionalFloat(
  v: string | undefined
): number | undefined {
  if (v == null) {
    return;
  }
  const ret = parseFloat(v);
  if (isFinite(ret)) {
    return ret;
  }
}
