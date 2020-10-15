/**
 * convert a keyboard event to hotkey string
 * syntax like https://www.autohotkey.com/docs/Hotkeys.htm#Symbols
 * modifier order is `#!^+`
 */
export default function toHotKey(e: KeyboardEvent): string {
  let ret = e.key;
  if (e.metaKey) {
    ret = '#' + ret;
  }
  if (e.altKey) {
    ret = '!' + ret;
  }
  if (e.ctrlKey) {
    ret = '^' + ret;
  }
  if (e.shiftKey) {
    ret = '+' + ret;
  }
  return ret;
}
