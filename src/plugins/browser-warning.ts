import { message } from '@/message';

if (navigator.userAgent.includes('Chrome/74.0.3729')) {
  const closeMessage = message((h) =>
    h(
      'li',
      {
        class:
          'p-3 rounded-sm w-64 mx-2 my-1 bg-orange-600 text-white break-all',
      },
      [
        h('button', { class: 'float-right', on: { click: closeMessage } }, '×'),
        h('p', '请升级浏览器'),
        h('p', { class: 'text-sm' }, [
          'Chrome/74.0.3729 有',
          h(
            'a',
            {
              class: 'underline mx-1',
              attrs: {
                href:
                  'https://bugs.chromium.org/p/chromium/issues/detail?id=961199',
                target: '_blank',
              },
            },
            'bug'
          ),
        ]),
      ]
    )
  );
}
