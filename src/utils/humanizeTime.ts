import cloneDate from '@/utils/cloneDate';
import moment from 'moment';

export default function humanizeTime(v: Date): string {
  const m = moment(v);
  return m.isBefore(cloneDate(new Date(), { month: -1 })) ||
    m.isAfter(cloneDate(new Date(), { month: 1 }))
    ? m.isBefore(cloneDate(new Date(), { year: -1 })) ||
      m.isAfter(cloneDate(new Date(), { year: 1 }))
      ? m.format('YYYY-MM-DD')
      : m.format('MMMM DD')
    : m.fromNow();
}
