import { Painter } from '@/svg-editor/painter';
import { SVGEditor } from '@/svg-editor/svg-editor';
import createSVGElement from '@/svg-editor/utils/createSVGElement';
import distanceVector2 from '@/svg-editor/utils/distanceVector2';
import { Vector2 } from '@/svg-editor/vector2';

export default class EllipsePainter extends Painter {
  public config = { strokeWidth: 3, color: 'red' };

  private target: { ellipse: SVGEllipseElement; origin: Vector2 } | undefined;

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
    const el = this.editor.pushOperation(createSVGElement('ellipse'));
    el.dataset.valueIgnore = 'true';
    const p = this.absoluteSVGPoint(e);
    this.target = { ellipse: el, origin: p };
  }

  private get mustTarget(): NonNullable<EllipsePainter['target']> {
    if (!this.target) {
      throw new Error('Should created elements');
    }
    return this.target;
  }

  public onPointermove(e: PointerEvent): void {
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
    if (distanceVector2(start, end) > this.config.strokeWidth * 2) {
      delete ellipse.dataset.valueIgnore;
    }

    ellipse.setAttribute('cx', ((start.x + end.x) / 2).toString());
    ellipse.setAttribute('cy', ((start.y + end.y) / 2).toString());
    ellipse.setAttribute('rx', ((end.x - start.x) / 2).toString());
    ellipse.setAttribute('ry', ((end.y - start.y) / 2).toString());
    ellipse.style.stroke = this.config.color;
    ellipse.style.strokeWidth = this.config.strokeWidth.toString();
  }

  public onPointerup(e: PointerEvent): void {
    super.onPointerup(e);
    this.target = undefined;
    this.editor.commit();
  }
}
