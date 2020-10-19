import distanceVector2 from '@/svg-editor/utils/distanceVector2';
import { Vector2 } from '@/svg-editor/vector2';

/** get points on given line with given max distance. */
export default function* iterateLinePoints(
  start: Vector2,
  end: Vector2,
  maxDistance: number
): IterableIterator<Vector2> {
  const n = Math.ceil(distanceVector2(start, end) / maxDistance);
  if (n === 0) {
    yield { x: start.x, y: start.y };
    return;
  }
  const dx = (end.x - start.x) / n;
  const dy = (end.y - start.y) / n;
  for (let i = 0; i <= n; i += 1) {
    yield {
      x: start.x + dx * i,
      y: start.y + dy * i,
    };
  }
}
