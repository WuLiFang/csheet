export default function parseColor(
  s: string
): { r: number; g: number; b: number } {
  if (/#[0-9a-f]{6}/i.test(s)) {
    return {
      r: parseInt(s.slice(1, 3), 16),
      g: parseInt(s.slice(3, 5), 16),
      b: parseInt(s.slice(5, 7), 16),
    };
  }
  return { r: NaN, g: NaN, b: NaN };
}
