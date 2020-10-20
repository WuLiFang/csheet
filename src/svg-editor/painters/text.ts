import { Painter } from '@/svg-editor/painter';
import { SVGEditor } from '@/svg-editor/svg-editor';
import createSVGElement from '@/svg-editor/utils/createSVGElement';
import iterateHTMLCollection from '@/svg-editor/utils/iterateHTMLCollection';
import relativeDOMPoint from '@/svg-editor/utils/relativeDOMPoint';
import autoGrowTextArea from '@/utils/autoGrowTextArea';
import toHotKey from '@/utils/toHotKey';

export class TextPainter extends Painter {
  config = {
    fontSize: 16,
    color: 'red',
    backgroundColor: 'black',
  };

  popupContainer: HTMLDivElement;

  private target:
    | {
        origin: DOMPoint;
        g: SVGGElement;
        text: SVGTextElement;
        rect: SVGRectElement;
      }
    | undefined;

  constructor(editor: SVGEditor) {
    super(editor);
    const rawCursor = editor.el.style.cursor;
    this.popupContainer = document.createElement('div');
    this.addCleanup(() => {
      editor.el.style.cursor = rawCursor;
      this.popupContainer.remove();
    });
    editor.el.style.cursor = 'text';
    editor.el.after(this.popupContainer);
  }

  private get mustTarget(): NonNullable<TextPainter['target']> {
    if (!this.target) {
      throw new Error('Should created elements');
    }
    return this.target;
  }

  onTextAreaCreate?(el: HTMLTextAreaElement): void;
  onTextAreaRender?(el: HTMLTextAreaElement): void;

  onPointerdown(e: PointerEvent): void {
    if (this.isDrawing) {
      this.editor.commit();
    }
    super.onPointerdown(e);
    this.popupContainer.style.pointerEvents = 'none';

    const origin = this.absoluteSVGPoint(e);

    for (const el of e.composedPath()) {
      if (el instanceof SVGGElement) {
        const first = el.firstChild;
        if (first instanceof SVGRectElement) {
          const second = first.nextSibling;
          if (second instanceof SVGTextElement) {
            this.target = {
              g: el,
              rect: first,
              text: second,
              origin,
            };
            this.showPopup();
            this.editor.hooks.drawStart?.(el);
            return;
          }
        }
      }
    }

    const g = this.editor.pushOperation(createSVGElement('g'));
    const rect = g.appendChild(createSVGElement('rect'));
    const text = g.appendChild(createSVGElement('text'));
    this.editor.pushOperation(g);
    this.target = { g, text, rect, origin };
    this.showPopup();
    this.editor.hooks.drawStart?.(g);
  }

  onPointermove(e: PointerEvent): void {
    if (!this.isDrawing) {
      return;
    }
    // e.preventDefault();
    this.mustTarget.origin = this.absoluteSVGPoint(e);
    this.renderPopup();
    this.renderText();
  }

  onPointerup(e: PointerEvent): void {
    super.onPointerup(e);
    if (!this.target) {
      return;
    }
    this.popupContainer.style.removeProperty('pointer-events');
    this.focus?.();
    this.editor.hooks.drawEnd?.(this.target.g);
  }

  focus?(): void;

  showPopup(): void {
    this.popupContainer.style.visibility = 'visible';
    this.renderText();
    this.renderPopup();
  }

  hidePopup(): void {
    this.popupContainer.style.visibility = 'hidden';
  }

  renderText(value: string = this.getValue()): void {
    if (!this.target) {
      return;
    }
    const {
      text,
      rect,
      g,
      origin: { x, y },
    } = this.target;

    if (!value) {
      g.dataset.valueIgnore = 'true';
      rect.style.visibility = 'hidden';
    } else {
      delete g.dataset.valueIgnore;
      rect.style.removeProperty('visibility');
    }

    const padding = this.config.fontSize * 0.5;
    const lines = value.split('\n');

    text.style.fill = this.config.color;
    text.style.fontSize = `${this.config.fontSize.toFixed(0)}px`;
    while (text.children.length < lines.length) {
      text.append(createSVGElement('tspan'));
    }
    while (text.children.length > lines.length) {
      text.lastChild?.remove();
    }
    let index = 0;
    for (const i of iterateHTMLCollection(text.children)) {
      i.textContent = lines[index];
      i.setAttribute('x', '0');
      i.setAttribute('y', '0');
      i.setAttribute('dy', (index * this.config.fontSize * 1.2).toFixed(0));
      index += 1;
    }

    const textBBox = text.getBBox();
    rect.setAttribute('x', (textBBox.x - padding).toFixed(0));
    rect.setAttribute('y', (textBBox.y - padding).toFixed(0));
    rect.setAttribute('width', (textBBox.width + 2 * padding).toFixed(0));
    rect.setAttribute('height', (textBBox.height + 2 * padding).toFixed(0));
    rect.style.fill = this.config.backgroundColor;
    rect.style.fillOpacity = '0.5';

    g.setAttribute(
      'transform',
      `translate(${(x + padding).toFixed(0)}, ${(
        y -
        text.getBBox().height +
        padding
      ).toFixed(0)})`
    );

    this.editor.hooks.changeValue?.();
  }

  getValue(): string {
    return Array.from(this.target?.text.querySelectorAll('tspan') ?? [])
      .map(i => i.textContent)
      .join('\n');
  }

  defaultRenderPopup(el: HTMLDivElement): void {
    let textarea: HTMLTextAreaElement;

    const match = el.querySelector('textarea');
    if (match) {
      textarea = match;
      if (textarea.scrollHeight > textarea.clientHeight) {
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    } else {
      textarea = document.createElement('textarea');
      el.append(textarea);
      textarea.placeholder = 'Ctrl+Enter 确定';
      this.focus = () => textarea.focus();
      autoGrowTextArea(textarea);
      textarea.addEventListener(
        'keyup',
        e => {
          if (toHotKey(e) === '^Enter') {
            e.preventDefault();
            this.hidePopup();
            this.editor.commit();
          }
        },
        { capture: true }
      );
      textarea.addEventListener('input', () => {
        this.renderText(textarea.value);
      });
      textarea.addEventListener('blur', () => {
        this.hidePopup();
        this.editor.commit();
      });
    }
    textarea.value = this.getValue();
  }

  customRenderPopup?(el: HTMLDivElement): void;

  renderPopup(): void {
    if (!this.target) {
      return;
    }
    const { origin } = this.target;
    const el = this.popupContainer;
    const { offsetX, offsetY } = relativeDOMPoint(this.editor.el, origin);
    el.style.position = 'absolute';
    el.style.left = `${offsetX}px`;
    el.style.top = `${offsetY}px`;
    (this.customRenderPopup ?? this.defaultRenderPopup)(el);
  }

  onValueChange(): void {
    if (this.target?.g.parentElement == null) {
      this.hidePopup();
    }
  }
}
