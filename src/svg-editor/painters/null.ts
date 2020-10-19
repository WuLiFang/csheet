import { Painter } from '@/svg-editor/painter';

export default class NullPainter extends Painter {
  onPointerdown(e: PointerEvent): void {
    e.preventDefault();
  }

  onPointerup(e: PointerEvent): void {
    e.preventDefault();
  }
}
