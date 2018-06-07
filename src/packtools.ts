export const isFileProtocol = window.location.protocol === 'file:';

export function SkipIfIsFileProtocol<T>(
  func: (...args: any[]) => T,
): (...args: any[]) => T | undefined;
export function SkipIfIsFileProtocol<T, K>(
  func: (...args: any[]) => T,
  defaultValue: K,
): (...args: any[]) => T | K;
export function SkipIfIsFileProtocol<T, K>(
  func: (...args: any[]) => T,
  defaultValue?: K,
): (...args: any[]) => T | K | undefined {
  function _func(...args: any[]) {
    if (isFileProtocol) {
      return defaultValue;
    }
    return func(...args);
  }
  return _func;
}
