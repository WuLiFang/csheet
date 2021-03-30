<template>
  <span :class="staticClass">{{ text }}</span>
</template>

<script lang="ts">
import { i18n } from '@/plugins/i18n';
import { computed, defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'CGTeamworkStatusWidget',
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  setup: (props) => {
    const text = computed((): string => {
      let ret = props.value;
      const i18nKey = `cgteamwork-status.${ret.toUpperCase()}`;
      if (i18n.te(i18nKey)) {
        ret = i18n.t(i18nKey).toString();
      }
      return ret;
    });
    const staticClass = computed((): string => {
      switch (props.value.toUpperCase()) {
        case 'APPROVE':
          return 'bg-green-600';
        case 'SUBMIT':
        case 'CHECK':
          return 'bg-yellow-600';
        case 'WAIT':
          return 'bg-blue-600';
        case 'RETAKE':
          return 'bg-red-600';
        default:
          return '';
      }
    });

    return {
      text,
      staticClass,
    };
  },
});
</script>
