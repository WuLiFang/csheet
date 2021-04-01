<template>
  <span :style="style" :class="staticClass">{{ text }}</span>
</template>

<script lang="ts">
import { useCgteamworkStatuses } from '@/graphql/queries/index.queries';
import { computed, defineComponent, toRefs } from '@vue/composition-api';
import { setupCommon } from './CGTeamworkStatusWidget';

export default defineComponent({
  name: 'CGTeamworkStatusWidget',
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  setup: (props) => {
    const { value } = toRefs(props);
    const { data: statuses } = useCgteamworkStatuses();
    const status = computed(() =>
      statuses.value?.cgteamworkStatuses.find(
        (i) => i.id === props.value || i.name === props.value
      )
    );

    const { style, text, staticClass } = setupCommon(value, status);

    return {
      text,
      style,
      staticClass,
    };
  },
});
</script>
