export interface Entry<T> {
  key: string;
  value: T;
  disabled?: boolean;
  label?: string;
}

export function isEntry(v: unknown): v is Entry<unknown> {
  try {
    return (
      typeof (v as { key?: unknown }).key === 'string' &&
      'value' in (v as { value?: unknown })
    );
  } catch {
    return false;
  }
}

export type Option<T> = T | Entry<T>;

export function optionEntries<T>(v: Option<T>[]): Entry<T>[] {
  if (v.every(i => isEntry(i))) {
    return v as Entry<T>[];
  }
  return v.map((i, index) => ({
    key: index.toString(),
    value: i as T,
  }));
}
