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

  onPointerdown(e: PointerEvent): void {
    this.isDrawing = true;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    e.preventDefault();
    this.editor.hooks.drawStart?.();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPointermove(e: PointerEvent): void {
    // pass
  }

  onPointerup(e: PointerEvent): void {
    this.isDrawing = false;
    e.preventDefault();
    this.editor.hooks.drawEnd?.();
  }

  onPointerover(e: PointerEvent): void {
    // pass
  }
  
  onPointerenter(e: PointerEvent): void {
    // pass
  }
  
  onPointerleave(e: PointerEvent): void {
    if (this.isDrawing){
      e.preventDefault();
      this.isDrawing = false
      this.editor.hooks.drawEnd?.();
    }
  }

  /** add cleanup that will be called once on destroy */
  addCleanup(fn: () => void): void {
    this.cleanup.push(fn);
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
