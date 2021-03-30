export function withBrowserCheck(fn: () => void): void {
  try {
    if (Object.entries === undefined) {
      throw new Error('Object.entries is not supported');
    }
    if (Array.prototype.flatMap === undefined) {
      throw new Error('Array.prototype.flatMap is not supported');
    }
    if (typeof CSS === 'undefined' || CSS.supports === undefined) {
      throw new Error('CSS.supports is not supported');
    }
    if (!CSS.supports('display', 'grid')) {
      throw new Error('grid layout is not supported');
    }
    fn();
  } catch (err) {
    const el = document.getElementById('app');
    if (!el) {
      throw new Error('missing app element');
    }
    el.innerHTML = '';

    const h1 = document.createElement('h1');
    h1.innerText = '请使用更新的浏览器';
    el.appendChild(h1);

    let p = document.createElement('p');
    p.innerText = '不支持所有版本的 IE，推荐使用谷歌或者火狐浏览器。';
    el.appendChild(p);
    p = document.createElement('p');
    p.innerText =
      '如果新版浏览器看到此信息，请检查是否启用了您浏览器的 IE 兼容模式。';
    el.appendChild(p);

    const pre = document.createElement('pre');
    pre.innerText = String(err);
    el.appendChild(pre);

    throw err;
  }
}
