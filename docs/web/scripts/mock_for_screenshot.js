// ==UserScript==
// @namespace https://github.com/WuLiFang/csheet
// @name     mock csheet for screenshot
// @version  1
// @run-at   document-end
// @include	 http://localhost:*
// ==/UserScript==

function getFilteredText(text) {
  return text[0] + '*'.repeat(text.length - 1);
}

setInterval(() => {
  document.querySelector('#app > header').hidden = true;
  document.querySelectorAll('.artist').forEach(i => {
    if (!(i instanceof HTMLElement)) {
      return;
    }
    i.innerText = getFilteredText(i.innerText);
  });
}, 1000);
