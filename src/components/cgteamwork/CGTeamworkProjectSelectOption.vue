<script lang="ts">
import Vue from 'vue';
import { cgteamworkProjects_cgteamworkProjects as Project } from '@/graphql/types/cgteamworkProjects';

export default Vue.extend<{
  value?: Project;
}>({
  functional: true,
  props: {
    value: { type: Object, default: undefined },
  },
  render(h, ctx) {
    const { value } = ctx.props;
    if (!value) {
      return [];
    }
    return h('div', ctx.data, [
      h('div', { staticClass: 'text-xs text-gray-500' }, [
        h('span', {}, value.codename),
        h(
          'span',
          {
            staticClass: 'px-1 rounded-sm text-white float-right',
            class: {
              'bg-blue-600': value.status.toUpperCase() === 'ACTIVE',
              'bg-gray-600': value.status.toUpperCase() === 'CLOSE',
              'bg-green-600': value.status.toUpperCase() === 'APPROVE',
              'bg-purple-600': value.status.toUpperCase() === 'WORK',
            },
          },
          value.status
        ),
      ]),
      h('div', { staticClass: 'text-lg' }, value.name),
    ]);
  },
});
</script>
