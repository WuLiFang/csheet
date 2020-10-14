export default function parseFrameRate(v: string): number {
  const [baseText, divText] = v.split('/');
  const base = parseFloat(baseText);
  const div = parseFloat(divText);
  if (isNaN(base)) {
    return 0;
  }
  if (isNaN(div)) {
    return base;
  }
  return base / div;
}
