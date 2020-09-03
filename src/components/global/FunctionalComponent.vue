<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  functional: true,
  props: { render: { type: Function, required: true } },
  render(h, ctx) {
    return ctx.props.render(h);
  },
});
</script>
