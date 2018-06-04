<template lang="pug">
  .lightbox-task-status(:status='statusText')
    | {{text}}  
</template>
<script lang="ts">
import Vue from 'vue';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { CGTeamWorkTaskData, TaskStatusText, TaskStatus } from '@/interface';
import { taskStatusTextL10n } from '@/statustools';
export default Vue.extend({
  props: {
    id: { type: String },
  },
  computed: {
    ...CGTeamWorkTaskComputedMixin,
    task(): CGTeamWorkTaskData {
      return this.cgTeamworkTaskStore.storage[this.id];
    },
    text(): string {
      return taskStatusTextL10n(this.statusText);
    },
    statusText(): TaskStatusText | null {
      return (TaskStatus[this.status] as TaskStatusText) || null;
    },
    status(): TaskStatus {
      return this.getGeneralStatus(this.id);
    },
  },
});
</script>
<style lang="scss" scoped>
@import '@/status-color.scss';

.lightbox-task-status {
  @include background-by-status(0.5);
}
</style>
