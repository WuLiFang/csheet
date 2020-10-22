import { Painter } from '@/svg-editor/painter';

export default class NullPainter extends Painter {
  onPointerDown(e: PointerEvent): void {
    e.preventDefault();
  }

  onPointerUp(e: PointerEvent): void {
    e.preventDefault();
  }
}
