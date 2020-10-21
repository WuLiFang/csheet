import { Painter } from '@/svg-editor/painter';
import { SVGEditor } from '@/svg-editor/svg-editor';
import createSVGElement from '@/svg-editor/utils/createSVGElement';
import distanceVector2 from '@/svg-editor/utils/distanceVector2';
import { Vector2 } from '@/svg-editor/vector2';

export default class RectanglePainter extends Painter {
  public config = { strokeWidth: 3, color: 'red', cornerRadius: 0 };
  private target: { rect: SVGRectElement; origin: Vector2 } | undefined;

  constructor(editor: SVGEditor) {
    super(editor);
    const rawCursor = editor.el.style.cursor;
    this.addCleanup(() => {
      editor.el.style.cursor = rawCursor;
    });
    editor.el.style.cursor = 'crosshair';
  }

  public onPointerdown(e: PointerEvent): void {
    super.onPointerdown(e);
    const el = this.editor.pushOperation(createSVGElement('rect'));
    el.dataset.valueIgnore = 'true';
    const p = this.absoluteSVGPoint(e);
    this.target = { rect: el, origin: p };
    this.editor.hooks.drawStart?.(el);
  }

  private get mustTarget(): NonNullable<RectanglePainter['target']> {
    if (!this.target) {
      throw new Error('Should created elements');
    }
    return this.target;
  }

  public onPointermove(e: PointerEvent): void {
    if (!this.isDrawing) {
      return;
    }
    const { rect, origin } = this.mustTarget;
    const p = this.absoluteSVGPoint(e);
    const start: Vector2 = {
      x: Math.min(origin.x, p.x),
      y: Math.min(origin.y, p.y),
    };
    const end: Vector2 = {
      x: Math.max(origin.x, p.x),
      y: Math.max(origin.y, p.y),
    };
    if (distanceVector2(start, end) > this.config.strokeWidth * 2) {
      delete rect.dataset.valueIgnore;
    }

    rect.setAttribute('x', start.x.toFixed(0));
    rect.setAttribute('y', start.y.toFixed(0));
    rect.setAttribute('width', (end.x - start.x).toFixed(0));
    rect.setAttribute('height', (end.y - start.y).toFixed(0));
    rect.setAttribute('rx', this.config.cornerRadius.toFixed(0));
    rect.style.stroke = this.config.color;
    rect.style.strokeWidth = `${this.config.strokeWidth.toFixed(0)}px`;
  }

  public onPointerup(e: PointerEvent): void {
    super.onPointerup(e);
    if (this.target) {
      this.editor.hooks.drawEnd?.(this.target.rect);
      this.target = undefined;
      this.editor.commit();
    }
  }
}
