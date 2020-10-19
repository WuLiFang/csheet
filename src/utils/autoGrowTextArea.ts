export default function autoGrowTextArea(el: HTMLTextAreaElement): void {
  el.addEventListener('input', () => {
    if (el.scrollHeight > el.clientHeight) {
      el.style.height = el.scrollHeight + 'px';
    }
  });
}
