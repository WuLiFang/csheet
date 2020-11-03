import { VNode } from 'vue';
import { Component, Vue } from 'vue-property-decorator';

/**
 * Mixin for renderless component
 */
@Component<RenderlessMixin>({
  render() {
    return this.renderRoot('default', {});
  },
})
export class RenderlessMixin extends Vue {
  renderSlot(slot = 'default', props?: Record<string, unknown>): VNode[] {
    return this.$scopedSlots[slot]?.(props) ?? [];
  }

  renderRoot(slot = 'default', props?: Record<string, unknown>): VNode {
    const nodes = this.renderSlot(slot, props);
    if (nodes?.length > 1) {
      return this.$createElement('div', nodes);
    }
    return nodes[0];
  }
}
