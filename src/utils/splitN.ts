/** split to exact n parts, last part may contains splitter. */
export default function splitN(v: string, splitter: string, n: number): string[] {
  const parts = v.split(splitter);
  const ret = parts.slice(0, n);
  while (ret.length < n) {
    ret.push('');
  }
  ret[n - 1] = parts.slice(n - 1).join(splitter);
  return ret;
}
