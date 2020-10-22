import { Painter } from '@/svg-editor/painter';
import createSVGElement from '@/svg-editor/utils/createSVGElement';
import distanceVector2 from '@/svg-editor/utils/distanceVector2';
import getCoalescedPointerEvents from '@/svg-editor/utils/getCoalescedPointerEvents';

function truncFractionDigits(
  v: number | undefined,
  max: number
): number | undefined {
  if (v == null) {
    return;
  }
  if (max < 0) {
    return v;
  }
  return parseFloat(v.toFixed(max));
}

export default class PolylinePainter extends Painter {
  config = { strokeWidth: 3, color: 'red' };
  maxFractionDigits = 0;

  private target: SVGPolylineElement | undefined;

  setup(): void {
    const el = this.editor.el;
    const rawCursor = el.style.cursor;
    this.addCleanup(() => {
      el.style.cursor = rawCursor;
    });
    el.style.cursor = 'pointer';
  }

  onPointerDown(e: PointerEvent): void {
    super.onPointerDown(e);
    const el = this.editor.pushOperation(createSVGElement('polyline'));
    el.style.stroke = this.config.color;
    el.style.strokeWidth = this.config.strokeWidth.toString();
    this.target = el;
    this.appendPointByEvent(e);
    this.editor.hooks.drawStart?.(el);
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.isDrawing || !this.target) {
      return;
    }
    this.appendPointByEvent(e);
  }

  onPointerUp(e: PointerEvent): void {
    super.onPointerUp(e);
    if (!this.target) {
      return;
    }
    this.appendPointByEvent(e);
    this.editor.hooks.drawEnd?.(this.target);
    this.target = undefined;
    this.editor.commit();
  }

  protected appendPoint(p: SVGPoint): void {
    if (!this.target) {
      return;
    }
    const el = this.target;
    if (el.points.length > 0) {
      const lastPoint = el.points.getItem(el.points.length - 1);
      if (distanceVector2(lastPoint, p) < this.config.strokeWidth * 2) {
        // ignore points that too close to last point
        return;
      }
    }
    p.x = truncFractionDigits(p.x, this.maxFractionDigits) ?? p.x;
    p.y = truncFractionDigits(p.y, this.maxFractionDigits) ?? p.y;
    p.z = truncFractionDigits(p.z, this.maxFractionDigits) ?? p.z;
    p.w = truncFractionDigits(p.w, this.maxFractionDigits) ?? p.w;
    el.points.appendItem(p);
  }

  protected appendPointByEvent(e: PointerEvent): void {
    if (!this.target) {
      return;
    }
    for (const i of getCoalescedPointerEvents(e)) {
      this.appendPoint(this.absoluteSVGPoint(i));
    }
    this.appendPoint(this.absoluteSVGPoint(e));
  }
}
