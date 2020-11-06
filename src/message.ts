import Vue, { CreateElement, VNode } from 'vue';

const listData = Vue.observable({
  messages: [] as {
    key: number;
    render: (h: CreateElement) => VNode;
  }[],
});

export const MessageList = Vue.extend<typeof listData, unknown, unknown, never>(
  {
    name: 'MessageList',
    data() {
      return listData;
    },
    render(h) {
      return h(
        'transition-group',
        {
          class: 'fixed bottom-0 right-0 flex flex-col-reverse items-end',
          props: {
            appear: true,
            tag: 'ol',
            moveClass: 'transition ease-in-out duration-200',
            enterActiveClass: 'transition ease-in-out duration-300',
            enterClass: 'opacity-0 transform translate-x-full',
            leaveActiveClass: 'transition ease-in-out duration-1000',
            leaveToClass: 'opacity-0',
          },
        },
        this.messages.map(i => {
          const ret = i.render(h);
          ret.key = i.key;
          return ret;
        })
      );
    },
  }
);

let nextKey = 0;

/**
 * add a message to list using render function.
 * @param render message render function
 * @returns message close function.
 */
export function message(render: (h: CreateElement) => VNode): () => void {
  const key = nextKey;
  nextKey += 1;

  listData.messages.splice(0, 0, { key, render });
  return () => {
    const index = listData.messages.findIndex(i => i.key === key);
    if (index < 0) {
      return;
    }
    listData.messages.splice(index, 1);
  };
}

export function info(text: string, duration = 3000 + 200 * text.length): void {
  const close = message(h =>
    h(
      'li',
      {
        class: 'p-3 rounded-sm w-64 mx-2 my-1 bg-gray-900 text-white break-all',
      },
      text
    )
  );
  setTimeout(close, duration);
}

export function error(text: string, duration = 3000 + 200 * text.length): void {
  const close = message(h =>
    h(
      'li',
      {
        class: 'p-3 rounded-sm w-64 mx-2 my-1 bg-red-700 text-white break-all',
      },
      text
    )
  );
  setTimeout(close, duration);
}
