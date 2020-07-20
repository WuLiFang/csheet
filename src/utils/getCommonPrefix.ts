export function getCommonPrefix(v: string[]): string {
  if (v.length === 0) {
    return '';
  }
  if (v.length === 1) {
    return v[0];
  }
  // return range is [0, w)
  let w = v[0].length;

  for (let i = 1; i < v.length; i++) {
    while (w > 0) {
      if (v[i - 1].slice(0, w) === v[i].slice(0, w)) {
        break;
      }
      w--;
    }
  }
  return v[0].slice(0, w);
}
