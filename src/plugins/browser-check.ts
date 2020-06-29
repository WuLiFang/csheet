if (Object.entries === undefined) {
  const el = document.getElementById('app');
  if (!el) {
    throw new Error('missing app element');
  }
  el.innerText = '浏览器版本过低';
  let p = document.createElement('p');
  p.innerText = '不支持所有版本的 IE，推荐使用谷歌或者火狐浏览器。';
  el.appendChild(p);
  p = document.createElement('p');
  p.innerText =
    '如果新版浏览器看到此信息，请检查是否启用了您浏览器的 IE 兼容模式。';
  el.appendChild(p);
  throw new Error('not supported browser');
}
