function createSVGElement<K extends keyof SVGElementTagNameMap>(
  qualifiedName: K
): SVGElementTagNameMap[K];
function createSVGElement(qualifiedName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', qualifiedName);
}

export default createSVGElement;
