import { Vector2 } from "@/svg-editor/vector2";

/** distance between points */
export default function distanceVector2(...points: Vector2[]): number {
  let ret = 0;
  for (let i = 1; i < points.length; i += 1) {
    const pa = points[i - 1];
    const pb = points[i];
    ret += Math.sqrt(Math.pow(pa.x - pb.x, 2) + Math.pow(pa.y - pb.y, 2));
  }
  return ret;
}
