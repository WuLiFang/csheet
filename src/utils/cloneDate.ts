export default function cloneDate(
  date: Date,
  offset?: {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    seconds?: number;
    milliseconds?: number;
  }
): Date {
  const ret = new Date(date);
  if (offset?.year) {
    ret.setFullYear(date.getFullYear() + offset.year);
  }
  if (offset?.month) {
    ret.setMonth(date.getMonth() + offset.month);
  }
  if (offset?.day) {
    ret.setDate(date.getDate() + offset.day);
  }
  if (offset?.hour) {
    ret.setHours(date.getHours() + offset.hour);
  }
  if (offset?.minute) {
    ret.setMinutes(date.getMinutes() + offset.minute);
  }
  if (offset?.seconds) {
    ret.setSeconds(date.getSeconds() + offset.seconds);
  }
  if (offset?.milliseconds) {
    ret.setMilliseconds(date.getMilliseconds() + offset.milliseconds);
  }
  return ret;
}
