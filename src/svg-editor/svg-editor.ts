import { Painter } from '@/svg-editor/painter';
import NullPainter from '@/svg-editor/painters/null';
import createSVGElement from '@/svg-editor/utils/createSVGElement';
import iterateHTMLCollection from '@/svg-editor/utils/iterateHTMLCollection';
import DOMPurify from 'dompurify';

export interface SVGEditorOptions {
  operationClass?: string;
  sanitize?: (v: string) => string;
  hooks?: {
    discardChanges?: () => void;
    clearHistory?: () => void;
    changeHistory?: () => void;
    undo?: () => void;
    redo?: () => void;
    setValue?: (v: string) => void;
    drawStart?: () => void;
    drawEnd?: () => void;
    pushOperation?: (el: SVGElement) => void;
    renderOperation?: (el: SVGElement) => void;
  };
}

function isUndoHistory(el: Element): boolean {
  return el instanceof SVGElement && el.style.visibility === 'hidden';
}

function isValueIgnore(el: SVGElement): boolean {
  if (isUndoHistory(el)) {
    return true;
  }
  if (el.dataset.valueIgnore === 'true') {
    return true;
  }
  return false;
}

/** renderValue while reuse element by index */
function renderValue(el: Element, safeValue: string) {
  const template = createSVGElement('g');
  template.innerHTML = safeValue;

  while (el.children.length < template.children.length) {
    el.append(createSVGElement('g'));
  }
  while (el.children.length > template.children.length) {
    el.lastChild?.remove();
  }
  for (let i = 0; i < el.children.length; i++) {
    const n = template.children.item(i);
    const o = el.children.item(i);
    if (!o || !n) {
      continue;
    }
    if (o.isEqualNode(n)) {
      continue;
    }
    o.outerHTML = n.outerHTML;
  }
}

export class SVGEditor {
  readonly el: SVGSVGElement;
  readonly operationClass: string;
  readonly valueContainer: Element;
  readonly editContainer: Element;
  readonly hooks: NonNullable<SVGEditorOptions['hooks']>;

  protected sanitize: (v: string) => string;

  private _painter: Painter;

  constructor(
    el: SVGSVGElement,
    {
      operationClass = '',
      hooks = {},
      sanitize = v => DOMPurify.sanitize(v),
    }: SVGEditorOptions = {}
  ) {
    this.el = el;
    this.operationClass = operationClass;
    this.hooks = hooks;
    this.sanitize = sanitize;
    this.valueContainer = createSVGElement('g');
    el.appendChild(this.valueContainer);
    this.editContainer = createSVGElement('g');
    el.appendChild(this.editContainer);
    el.addEventListener('click', e => this.painter.onClick(e));
    el.addEventListener('pointerdown', e => this.painter.onPointerdown(e));
    el.addEventListener('pointermove', e => this.painter.onPointermove(e));
    el.addEventListener('pointerup', e => this.painter.onPointerup(e));
    el.addEventListener('pointerover', e => this.painter.onPointerover(e));
    el.addEventListener('pointerenter', e => this.painter.onPointerenter(e));
    el.addEventListener('pointerleave', e => this.painter.onPointerleave(e));

    this._painter = new NullPainter(this);
  }

  get painter(): Painter {
    return this._painter;
  }

  set painter(v: Painter) {
    this._painter.destroy();
    this._painter = v;
    delete this.el.dataset.drawing;
  }

  discardChanges(): void {
    for (const i of this.iterateOperations()) {
      if (isValueIgnore(i)) {
        continue;
      }
      if (!(i.parentElement === this.valueContainer)) {
        i.remove();
      }
    }
    this.hooks.discardChanges?.();
  }

  /** clear history for redo */
  clearHistory(): void {
    for (const i of iterateHTMLCollection(this.editContainer.children)) {
      if (isUndoHistory(i)) {
        i.remove();
      }
    }
    this.hooks.clearHistory?.();
    this.hooks.changeHistory?.();
  }

  getValue(): string {
    const data: string[] = [];
    for (const i of this.iterateOperations()) {
      if (isValueIgnore(i)) {
        continue;
      }
      data.push(i.outerHTML);
    }
    return data.join('').trim();
  }

  // Update call renderOperation hooks on all operations.
  update(): void {
    if (!this.hooks.renderOperation) {
      return;
    }
    for (const i of this.iterateOperations()) {
      this.hooks.renderOperation(i);
    }
  }

  setValue(v: string): void {
    this.discardChanges();
    const safeValue = this.sanitize(v);
    renderValue(this.valueContainer, safeValue);
    this.painter.onValueChange(safeValue)
    this.hooks.setValue?.(safeValue);
    this.update();
  }

  canUndo(): boolean {
    for (const i of this.iterateOperations()) {
      if (isValueIgnore(i)) {
        continue;
      }
      return true;
    }
    return false;
  }

  canRedo(): boolean {
    for (const i of this.iterateOperations(true)) {
      if (isUndoHistory(i)) {
        return true;
      }
    }
    return false;
  }

  undo(): void {
    for (const el of this.iterateOperations(true)) {
      if (isValueIgnore(el)) {
        continue;
      }
      this.weakRemove(el);
      this.hooks.undo?.();
      this.hooks.changeHistory?.();
      return;
    }
  }

  redo(): void {
    for (const el of this.iterateOperations(false)) {
      if (isUndoHistory(el)) {
        el.style.removeProperty('visibility');
        this.hooks.redo?.();
        this.hooks.changeHistory?.();
        return;
      }
    }
  }

  pushOperation<T extends SVGElement>(el: T): T {
    if (this.operationClass) {
      el.classList.add(this.operationClass);
    }
    const ret = this.editContainer.appendChild(el);
    this.hooks.pushOperation?.(ret);
    return ret;
  }

  isOperation(e: SVGElement): boolean {
    return (
      e.parentElement === this.valueContainer ||
      e.parentElement === this.editContainer
    );
  }

  operation(index: number): SVGElement | undefined {
    if (index < 0) {
      return;
    }
    let cur = 0;
    for (const i of this.iterateOperations()) {
      if (cur === index) {
        return i;
      }
      cur += 1;
    }
  }

  indexOfOperation(el: SVGElement): number {
    let cur = 0;
    for (const i of this.iterateOperations()) {
      if (i === el) {
        return cur;
      }
      cur += 1;
    }
    return -1;
  }

  protected *iterateOperations(reverse = false): IterableIterator<SVGElement> {
    const containers = [this.valueContainer, this.editContainer];
    if (reverse) {
      containers.reverse();
    }
    for (const i of containers) {
      for (const el of iterateHTMLCollection(i.children, reverse)) {
        if (!(el instanceof SVGElement)) {
          continue;
        }
        yield el;
      }
    }
  }

  protected weakRemove(el: SVGElement): void {
    if (el.parentElement === this.valueContainer) {
      this.editContainer.prepend(el);
    }
    el.style.visibility = 'hidden';
  }
}
