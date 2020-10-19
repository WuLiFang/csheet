import NullPainter from '@/svg-editor/painters/null';
import { SVGEditor } from '@/svg-editor/svg-editor';
import createSVGElement from '@/svg-editor/utils/createSVGElement';

export default class SelectPainter extends NullPainter {

  protected target: { selector: { fg: SVGRectElement; bg: SVGRectElement } };

  private _selected = -1;

  get selected(): number {
    return this._selected;
  }

  set selected(v: number) {
    this._selected = v;
    this.render();
    this.onSelect?.(v);
  }

  constructor(editor: SVGEditor) {
    super(editor);

    const bg = this.editor.el.appendChild(createSVGElement('rect'));
    bg.classList.add('selector', 'bg');
    const fg = this.editor.el.appendChild(createSVGElement('rect'));
    fg.classList.add('selector', 'fg');
    this.target = {
      selector: {
        fg,
        bg,
      },
    };
    this.addCleanup(() => {
      bg.remove();
      fg.remove();
    });

    this.addCleanup(() => {
      delete editor.el.dataset.mode
    });
    editor.el.dataset.mode = 'select'
  }

  onSelect?(index: number): void;

  onClick(e: MouseEvent): void {
    for (const el of e.composedPath()) {
      if (el instanceof SVGGraphicsElement && this.editor.isOperation(el)) {
        this.selected = this.editor.indexOfOperation(el);
        return;
      }
    }
    this.selected = -1;
  }

  protected render(): void {
    this.renderRect(this.target.selector.fg);
    this.renderRect(this.target.selector.bg);
  }

  private renderRect(rect: SVGRectElement): void {
    const selectedEl = this.editor.operation(this.selected);
    if (!(selectedEl instanceof SVGGraphicsElement)) {
      rect.style.visibility = 'hidden';
      return;
    }

    const { x, y, width, height } = selectedEl.getBBox();
    const padding = 10;
    rect.setAttribute('x', (x - padding).toString());
    rect.setAttribute('y', (y - padding).toString());
    rect.setAttribute('width', (width + 2 * padding).toString());
    rect.setAttribute('height', (height + 2 * padding).toString());
    rect.style.removeProperty('visibility');
    rect.setAttribute('transform', selectedEl.getAttribute('transform') || '');
  }
}
