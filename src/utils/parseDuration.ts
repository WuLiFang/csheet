import { Duration } from '@/utils/duration';

export default function parseDuration(value: string): number {
  let v = value;
  let sign = 1;
  if (v[0] === '-') {
    v = v.slice(1);
    sign = -1;
  }
  const parts = v.split(':');
  parts.splice(0, 0, ...['0', '0'].splice(parts.length - 1));
  const [hours, minutes, seconds] = parts;

  let ret = 0;
  if (hours) {
    ret += parseFloat(hours) * Duration.HOUR;
  }
  if (minutes) {
    ret += parseFloat(minutes) * Duration.MINUTE;
  }
  if (seconds) {
    ret += parseFloat(seconds) * Duration.SECOND;
  }
  ret *= sign;
  return ret;
}
