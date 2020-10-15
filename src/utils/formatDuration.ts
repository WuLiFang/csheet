
function padLeft(v: string, c: string, n: number): string {
  while (v.length < n) {
    v = c + v;
  }
  return v;
}

function formatSeconds(v: number): string {
  let ret = v.toFixed(3);
  if (ret.indexOf('.') < 2) {
    ret = '0' + ret;
  }
  return ret;
}

/**
 * Format duration to `HH:MM:SS.sss` format
 */
export default function formatDuration(
  milliseconds: number,
  fixed = false
): string {
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

  let ret = `${padLeft(hours.toFixed(0), '0', 2)}:${padLeft(
    minutes.toFixed(0),
    '0',
    2
  )}:${formatSeconds(seconds)}`;
  if (!fixed) {
    if (ret.startsWith('00:')) {
      ret = ret.slice(3);
    }
    if (ret[0] === '0' && ret[1] !== ':') {
      ret = ret.slice(1);
    }
    if (ret.endsWith('.000')) {
      ret = ret.slice(0, -4);
    }
  }
  ret = sign + ret;
  return ret;
}
