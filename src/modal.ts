import Vue, { CreateElement, VNode, VNodeData, VueConstructor } from 'vue';

const wrapperData = Vue.observable({
  modals: [] as {
    key: number;
    render: (h: CreateElement) => VNode;
  }[],
});

export const ModalWrapper = Vue.extend<
  typeof wrapperData,
  unknown,
  unknown,
  never
>({
  name: 'ModalWrapper',
  data() {
    return wrapperData;
  },
  render(h) {
    return h(
      'div',
      {},
      this.modals.map(i => {
        const ret = i.render(h);
        ret.key = i.key;
        return ret;
      })
    );
  },
});

let nextKey = 0;

/**
 * Open a modal component
 * @returns modal close function
 */
export function open(render: (h: CreateElement) => VNode): () => void {
  const key = nextKey;
  nextKey += 1;

  wrapperData.modals.push({
    key,
    render,
  });
  return () => {
    const index = wrapperData.modals.findIndex(i => i.key === key);
    if (index < 0) {
      return;
    }
    wrapperData.modals.splice(index, 1);
  };
}

/**
 * Open a component and close it on `close` event.
 * @param constructor Component constructor
 * @param data Component data
 */
export function show<V extends Vue>(
  constructor: VueConstructor<V>,
  data?: VNodeData
): void {
  const close = open(h =>
    h(constructor, {
      ...data,
      on: {
        ...data?.on,
        close: [
          ...(() => {
            const v = data?.on?.close ?? [];
            if (Array.isArray(v)) {
              return v;
            }
            return [v];
          })(),
          close,
        ],
      },
    })
  );
}
