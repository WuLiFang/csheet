export default function searchParamsSetAll(
  params: URLSearchParams,
  name: string,
  values: string[]
): void {
  params.delete(name);
  for (const i of values) {
    params.append(name, i);
  }
}
