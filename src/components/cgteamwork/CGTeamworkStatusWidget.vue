<template lang="pug">
  span(
    :class="staticClass"
    :style=`style`
  ) {{ text }}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { CGTeamworkStatus } from '@/graphql/queries/cgteamworkStatuses';
import parseColor from '@/utils/parseColor';
import getColorLightness from '@/utils/getColorLightness';
import queries from '@/graphql/queries';

@Component<CGTeamworkStatusWidget>({
  apollo: {
    statuses: queries.vue.cgteamworkStatuses<CGTeamworkStatusWidget>({}),
  },
})
export default class CGTeamworkStatusWidget extends Vue {
  @Prop({ type: String, required: true })
  value!: string;

  statuses?: CGTeamworkStatus[];
  get status(): CGTeamworkStatus | undefined {
    return this.statuses?.find(
      i => i.id === this.value || i.name === this.value
    );
  }

  get text(): string {
    let ret = this.status?.name ?? this.value;
    const i18nKey = `cgteamwork-status.${ret.toUpperCase()}`;
    if (this.$te(i18nKey)) {
      ret = this.$t(i18nKey).toString();
    }
    return ret;
  }

  get staticClass(): string {
    switch (this.value.toUpperCase()) {
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
  }

  get style(): Record<string, string | undefined> {
    if (!this.status) {
      return {};
    }
    return {
      backgroundColor: this.status.color,
      color:
        getColorLightness(parseColor(this.status.color)) > 0.5
          ? '#000000'
          : '#ffffff',
    };
  }
}
</script>
