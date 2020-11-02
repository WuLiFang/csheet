<template lang="pug">
  span(:class="staticClass") {{value && $t('cgteamwork-status.'+value.toUpperCase())}}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component<CGTeamworkTaskStatus>({})
export default class CGTeamworkTaskStatus extends Vue {
  @Prop({ type: String, required: true })
  value!: string;
  
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
}
</script>
