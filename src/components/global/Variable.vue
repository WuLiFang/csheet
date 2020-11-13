<script lang="ts">
import Vue from 'vue';
const Variable = Vue.extend({
  functional: true,
  render(h, ctx) {
    const children = ctx.scopedSlots.default(ctx.data.attrs);
    if (children?.length === 1) {
      return children[0];
    }
    return h('div', children);
  },
});
export default Variable;
</script>
