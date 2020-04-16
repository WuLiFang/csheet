<template lang="pug">
  span(:class="staticClass") {{$t('cgteamwork-status.'+value)}}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component<CGTeamworkTaskStatus>({})
export default class CGTeamworkTaskStatus extends Vue {
  @Prop({ type: String, required: true })
  value!: string;
  get staticClass(): string {
    switch (this.value) {
      case 'Approve':
        return 'bg-green-600';
      case 'Check':
        return 'bg-yellow-600';
      case 'Wait':
        return 'bg-blue-600';
      case 'Retake':
        return 'bg-red-600';
      default:
        return '';
    }
  }
}
</script>
