import { SVGEditor } from '@/svg-editor';
import absoluteSVGPoint from '@/svg-editor/utils/absoluteSVGPoint';

export abstract class Painter {
  isDrawing = false;
  editor: SVGEditor;

  protected cleanup: (() => void)[] = [];

  constructor(editor: SVGEditor) {
    this.editor = editor;
  }

  onClick(e: MouseEvent): void {
    e.preventDefault();
  }

  onPointerDown(e: PointerEvent): void {
    this.isDrawing = true;
    this.editor.el.dataset.drawing = 'true';
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    e.preventDefault();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPointerMove(e: PointerEvent): void {
    // pass
  }

  onPointerUp(e: PointerEvent): void {
    this.isDrawing = false;
    delete this.editor.el.dataset.drawing;
    e.preventDefault();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPointerOver(e: PointerEvent): void {
    // pass
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPointerEnter(e: PointerEvent): void {
    // pass
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPointerLeave(e: PointerEvent): void {
    // pass
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onValueChange(v: string): void {
    // pass
  }

  /** add cleanup that will be called once on destroy */
  addCleanup(fn: () => void): void {
    this.cleanup.push(fn);
  }

  /** setup when change painter to this */
  setup(): void {
    // pass
  }

  /** cleanup before change painter  */
  destroy(): void {
    while (this.cleanup.length > 0) {
      this.cleanup.pop()?.();
    }
  }

  protected absoluteSVGPoint(e: {
    clientX: number;
    clientY: number;
  }): SVGPoint {
    return absoluteSVGPoint(this.editor.el, e.clientX, e.clientY);
  }
}
