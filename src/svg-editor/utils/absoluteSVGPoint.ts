export default function absoluteSVGPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): SVGPoint {
  const matrix = svg.getScreenCTM();
  if (!matrix) {
    throw new Error('absoluteSVGPoint: should has screen matrix');
  }
  const p = svg.createSVGPoint();
  p.x = clientX;
  p.y = clientY;
  return p.matrixTransform(matrix.inverse());
}
