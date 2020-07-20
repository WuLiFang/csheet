import { OriginPrefix } from '@/client';
import { State } from '@/db/core';
import * as cast from 'cast-unknown';

export class RecentOriginPrefix extends State<OriginPrefix[]> {
  private static key = 'recent-origin-prefix';
  private static capacity = 128;

  save(state: OriginPrefix[]): void {
    localStorage.setItem(
      RecentOriginPrefix.key,
      JSON.stringify(
        state.slice(0, RecentOriginPrefix.capacity).map(i => i.toString())
      )
    );
  }

  load(): OriginPrefix[] | undefined {
    const v = localStorage.getItem(RecentOriginPrefix.key);
    if (v === undefined || v === null) {
      return;
    }
    try {
      return cast
        .array(JSON.parse(v))
        .map(cast.string)
        .map(OriginPrefix.parse)
        .map(cast.nonNull);
    } catch (err) {
      if (err instanceof cast.CastError) {
        return;
      }
      throw err;
    }
  }

  /** push to item before first item, and prune data to avoid overlapped prefix. */
  push(v: OriginPrefix): void {
    if (v.isZero()) {
      return;
    }

    const data = this.get();
    if (data.length > 0 && data[0].equals(v)) {
      return;
    }
    this.set([v, ...data.filter(i => !i.equals(v))]);
  }
}
