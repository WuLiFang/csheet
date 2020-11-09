<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  functional: true,
  props: {
    tag: { type: String, required: true },
    render: { type: Function, required: true },
  },
  render(h, { props: { tag, render }, data }) {
    let children = render(h);
    if (!Array.isArray(children)) {
      children = [children];
    }
    return h(tag, data, children);
  },
});
</script>
