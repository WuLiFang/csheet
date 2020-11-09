<script lang="ts">
import Vue from 'vue';
import { cgteamworkPipelines_cgteamworkPipelines as Pipeline } from '@/graphql/types/cgteamworkPipelines';

export default Vue.extend<{
  value?: Pipeline;
  tag: string;
}>({
  functional: true,
  props: {
    value: { type: Object, default: undefined },
    tag: { type: String, default: 'div' },
  },
  render(h, ctx) {
    const { value, tag } = ctx.props;
    if (!value) {
      return [];
    }
    return h(tag, ctx.data, [
      h('div', { staticClass: 'text-xs text-gray-500' }, [
        h(
          'span',
          {},
          value.description === value.name ? '' : value.description
        ),
      ]),
      h('div', { staticClass: 'text-lg' }, value.name),
    ]);
  },
});
</script>
