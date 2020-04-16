import { app } from '@/main';
import Vue, { VNode, VNodeData, VueConstructor } from 'vue';

/**
 * Show a modal vue component
 * @param constructor Component constructor
 * @param data Component data
 */
export function show<V extends Vue>(
  constructor: VueConstructor<V>,
  data?: VNodeData
): V {
  const wrapper = new Vue({
    name: 'ModalWrapper',
    parent: app,
    data: {
      visible: false,
    },
    mounted(): void {
      this.visible = true;
    },
    render(h): VNode {
      const d: VNodeData = {
        ...data,
        props: {
          ...(data && data.props),
          visible: this.$data.visible,
        },
        on: {
          ...(data && data.on),
          'update:visible': (v: boolean): void => {
            this.$data.visible = v;
          },
          close: () => {
            this.$destroy();
            this.$el.remove();
          },
        },
      };
      return h(constructor, d);
    },
  });
  wrapper.$mount(document.createElement('div'));
  wrapper.$parent.$el.append(wrapper.$el);
  const ret = wrapper.$children[0] as V;
  return ret;
}
