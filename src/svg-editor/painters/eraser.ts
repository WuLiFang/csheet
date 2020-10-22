import { Painter } from '@/svg-editor/painter';
import { SVGEditor } from '@/svg-editor/svg-editor';
import createSVGElement from '@/svg-editor/utils/createSVGElement';
import distanceVector2 from '@/svg-editor/utils/distanceVector2';
import iterateLinePoints from '@/svg-editor/utils/iterateLinePoints';
import { Vector2 } from '@/svg-editor/vector2';

export default class EraserPainter extends Painter {
  config = { width: 8, opacity: 1 };
  bgHref: string;

  private target:
    | {
        g: SVGGElement;
        mask: SVGMaskElement;
        use: SVGUseElement;
      }
    | undefined;

  private lastCircle: SVGCircleElement | undefined;

  constructor(editor: SVGEditor, bgHref: string) {
    super(editor);
    this.bgHref = bgHref;
  }

  setup(): void {
    const el = this.editor.el;
    const rawCursor = el.style.cursor;
    this.addCleanup(() => {
      el.style.cursor = rawCursor;
    });
    el.style.cursor = 'pointer';
  }

  onPointerdown(e: PointerEvent): void {
    super.onPointerdown(e);
    const g = this.editor.pushOperation(createSVGElement('g'));
    g.dataset.type = 'eraser';
    const mask = g.appendChild(createSVGElement('mask'));
    mask.id = `eraser-${Date.now()}`;
    mask.style.fill = 'white';
    const use = g.appendChild(createSVGElement('use'));
    use.setAttribute('href', this.bgHref);
    use.setAttribute('mask', `url(#${mask.id})`);
    this.target = { g, mask, use };
  }

  private get mustTarget(): NonNullable<EraserPainter['target']> {
    if (!this.target) {
      throw new Error('Should created elements');
    }
    return this.target;
  }

  onPointermove(e: PointerEvent): void {
    if (!this.isDrawing) {
      return;
    }
    const { mask, use } = this.mustTarget;
    use.style.opacity = this.config.opacity.toString();
    const p = this.absoluteSVGPoint(e);
    const end: Vector2 = { x: p.x, y: p.y };
    const start: Vector2 = this.lastCircle
      ? {
          x: this.lastCircle.cx.baseVal.value,
          y: this.lastCircle.cy.baseVal.value,
        }
      : { ...end };
    const unitLength = this.config.width / 2;
    const l = distanceVector2(start, end);
    if (this.lastCircle && l < unitLength) {
      return;
    }
    const endRadius = this.config.width * e.pressure * 2;
    const startRadius = this.lastCircle
      ? this.lastCircle.r.baseVal.value
      : endRadius;
    for (const i of iterateLinePoints(start, end, unitLength)) {
      const r =
        l > 0
          ? startRadius +
            (endRadius - startRadius) * (distanceVector2(i, start) / l)
          : startRadius;
      const cx = i.x;
      const cy = i.y;
      const circle = mask.appendChild(createSVGElement('circle'));
      circle.setAttribute('r', r.toString());
      circle.setAttribute('cx', cx.toString());
      circle.setAttribute('cy', cy.toString());
      this.lastCircle = circle;
    }
  }

  onPointerup(e: PointerEvent): void {
    super.onPointerup(e);
    delete this.target;
    delete this.lastCircle;
  }
}
