function formatAmount(v: number): string {
  let ret = v.toFixed(3);
  if (ret.indexOf('.') < 2) {
    ret = '0' + ret;
  }
  if (ret.endsWith('.000')) {
    ret = ret.slice(0, -4);
  }
  return ret;
}

/**
 * Format duration to `HH:MM:SS.sss` format
 */
export default function formatDuration(milliseconds: number): string {
  let v = milliseconds;
  let sign = '';
  if (v < 0) {
    sign = '-';
    v = -v;
  }
  v = v / 1e3;
  const seconds = v % 60;
  v = Math.trunc(v / 60);
  const minutes = v % 60;
  v = Math.trunc(v / 60);
  const hours = v;

  return `${sign}${formatAmount(hours)}:${formatAmount(minutes)}:${formatAmount(
    seconds
  )}`;
}
