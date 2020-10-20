export default function relativeDOMPoint(
  svg: SVGSVGElement,
  p: SVGPoint
): { clientX: number; clientY: number; offsetX: number; offsetY: number } {
  const matrix = svg.getScreenCTM();
  if (!matrix) {
    throw new Error('absoluteSVGPoint: should has screen matrix');
  }
  const bBox = svg.getBoundingClientRect();
  const cp = p.matrixTransform(matrix);

  return {
    clientX: cp.x,
    clientY: cp.y,
    offsetX: cp.x - bBox.left,
    offsetY: cp.y - bBox.top,
  };
}
