import { CGTeamworkStatus } from '@/graphql/queries/cgteamworkStatuses';
import { tr } from '@/plugins/i18n';
import getColorLightness from '@/utils/getColorLightness';
import parseColor from '@/utils/parseColor';
import { computed, Ref } from '@vue/composition-api';

export function setupCommon(
  value: Ref<string>,
  status: Ref<CGTeamworkStatus | undefined>
): {
  text: Ref<string>;
  staticClass: Ref<string>;
  style: Ref<Record<string, string | undefined>>;
} {
  const style = computed(() => {
    if (!status.value) {
      return {};
    }
    return {
      backgroundColor: status.value.color,
      color:
        getColorLightness(parseColor(status.value.color)) > 0.5
          ? '#000000'
          : '#ffffff',
    };
  });
  const text = computed((): string => {
    const ret = status.value?.name ?? value.value;
    return tr(`cgteamwork-status.${ret.toUpperCase()}`, ret);
  });

  const staticClass = computed(() => {
    switch (value.value.toUpperCase()) {
      // provide fallback background colors 
      // when cgteamwork server not available
      case 'APPROVE':
        return 'bg-green-600';
      case 'SUBMIT':
      case 'CHECK':
        return 'bg-yellow-600';
      case 'WAIT':
        return 'bg-blue-600';
      case 'ACTIVE':
        return 'bg-indigo-600';
      case 'RETAKE':
        return 'bg-red-600';
      default:
        return '';
    }
  });
  return {
    style,
    text,
    staticClass,
  };
}
