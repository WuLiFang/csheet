export const isFileProtocol = window.location.protocol === 'file:';

export function skipIfIsFileProtocol<T>(
  func: (...args: any[]) => T
): (...args: any[]) => T | undefined;
export function skipIfIsFileProtocol<T, K>(
  func: (...args: any[]) => T,
  defaultValue: K
): (...args: any[]) => T | K;
export function skipIfIsFileProtocol<T, K>(
  func: (...args: any[]) => T,
  defaultValue?: K
): (...args: any[]) => T | K | undefined {
  function wrappedFunc(...args: any[]) {
    if (isFileProtocol) {
      return defaultValue;
    }
    return func(...args);
  }
  return wrappedFunc;
}
