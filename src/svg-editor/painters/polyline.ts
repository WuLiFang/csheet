import { Painter } from '@/svg-editor/painter';
import { SVGEditor } from '@/svg-editor/svg-editor';
import createSVGElement from '@/svg-editor/utils/createSVGElement';

export default class PolylinePainter extends Painter {
  config = { strokeWidth: 3, color: 'red' };
  private target: SVGPolylineElement | undefined;

  constructor(editor: SVGEditor) {
    super(editor);
    const rawCursor = editor.el.style.cursor;
    this.addCleanup(() => {
      editor.el.style.cursor = rawCursor;
    });
    editor.el.style.cursor = 'pointer';
  }

  onPointerdown(e: PointerEvent): void {
    super.onPointerdown(e);
    const el = this.editor.pushOperation(createSVGElement('polyline'));
    el.dataset.valueIgnore = 'true';
    el.points.appendItem(this.absoluteSVGPoint(e));
    this.target = el;
  }

  onPointermove(e: PointerEvent): void {
    if (!this.isDrawing || !this.target) {
      return;
    }
    const target = this.target;
    const p = this.absoluteSVGPoint(e);
    target.points.appendItem(p);
    if (target.points.length > 3) {
      delete target.dataset.valueIgnore;
    }
    target.style.stroke = this.config.color;
    target.style.strokeWidth = this.config.strokeWidth.toString();
  }

  onPointerup(e: PointerEvent): void {
    super.onPointerup(e);
    this.target?.points.appendItem(this.absoluteSVGPoint(e));
    this.target = undefined;
    this.editor.commit();
  }
}
