import { Painter } from '@/svg-editor/painter';
import createSVGElement from '@/svg-editor/utils/createSVGElement';
import { Vector2 } from '@/svg-editor/vector2';

export default class EllipsePainter extends Painter {
  public config = { strokeWidth: 3, color: 'red' };

  private target: { ellipse: SVGEllipseElement; origin: Vector2 } | undefined;

  setup(): void {
    const el = this.editor.el;
    const rawCursor = el.style.cursor;
    this.addCleanup(() => {
      el.style.cursor = rawCursor;
    });
    el.style.cursor = 'crosshair';
  }

  public onPointerDown(e: PointerEvent): void {
    super.onPointerDown(e);
    const el = this.editor.pushOperation(createSVGElement('ellipse'));
    const p = this.absoluteSVGPoint(e);
    this.target = { ellipse: el, origin: p };
    this.editor.hooks.drawStart?.(el);
  }

  private get mustTarget(): NonNullable<EllipsePainter['target']> {
    if (!this.target) {
      throw new Error('Should created elements');
    }
    return this.target;
  }

  public onPointerMove(e: PointerEvent): void {
    if (!this.isDrawing) {
      return;
    }
    const { ellipse, origin } = this.mustTarget;
    const p = this.absoluteSVGPoint(e);
    const start: Vector2 = {
      x: Math.min(origin.x, p.x),
      y: Math.min(origin.y, p.y),
    };
    const end: Vector2 = {
      x: Math.max(origin.x, p.x),
      y: Math.max(origin.y, p.y),
    };

    ellipse.setAttribute('cx', ((start.x + end.x) / 2).toFixed(0));
    ellipse.setAttribute('cy', ((start.y + end.y) / 2).toFixed(0));
    ellipse.setAttribute('rx', ((end.x - start.x) / 2).toFixed(0));
    ellipse.setAttribute('ry', ((end.y - start.y) / 2).toFixed(0));
    ellipse.style.stroke = this.config.color;
    ellipse.style.strokeWidth = `${this.config.strokeWidth.toFixed(0)}px`;
  }

  public onPointerUp(e: PointerEvent): void {
    super.onPointerUp(e);
    if (this.target) {
      this.editor.hooks.drawEnd?.(this.target.ellipse);
      this.target = undefined;
      this.editor.commit();
    }
  }
}
