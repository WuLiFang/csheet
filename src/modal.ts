import Vue, { CreateElement, VNode, VNodeData, VueConstructor } from 'vue';

const wrapperData = Vue.observable({
  modals: [] as {
    key: number;
    render: (h: CreateElement) => VNode;
  }[],
});

export const ModalWrapper = Vue.extend<
  {
    modals: typeof wrapperData.modals;
  },
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

let nextModalKey = 0;

/**
 * Show a modal vue component
 * @param constructor Component constructor
 * @param data Component data
 */
export function show<V extends Vue>(
  constructor: VueConstructor<V>,
  data?: VNodeData
): void {
  const key = nextModalKey;
  nextModalKey += 1;

  const props = Vue.observable({ visible: false });
  wrapperData.modals.push({
    key,
    render(h) {
      const d: VNodeData = {
        ...data,
        props: {
          ...data?.props,
          ...props,
        },
        on: {
          ...(data && data.on),
          'update:visible': (v: boolean): void => {
            props.visible = v;
          },
          close: () => {
            const index = wrapperData.modals.findIndex(i => i.key === key);
            if (index < 0) {
              return;
            }
            wrapperData.modals.splice(index, 1);
          },
        },
      };
      return h(constructor, d);
    },
  });
  setTimeout(() => {
    props.visible = true;
  }, 0);
}
