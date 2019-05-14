<template lang="pug">
  .lightbox-task-status(:status='statusText')
    | {{text}}
</template>
<script lang="ts">
import Vue from 'vue';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import {
  ICGTeamWorkTaskResponse,
  TaskStatusText,
  TaskStatus,
  TaskStage,
} from '@/interface';
import { taskStatusTextL10n } from '@/statustools';

export default Vue.extend({
  props: {
    id: { type: String },
    statusStage: {
      type: <() => TaskStage>Number,
      default: TaskStage.director,
    },
  },
  computed: {
    ...CGTeamWorkTaskComputedMixin,
    task(): ICGTeamWorkTaskResponse | undefined {
      return this.cgTeamworkTaskStore.storage[this.id];
    },
    text(): string {
      return taskStatusTextL10n(this.statusText);
    },
    statusText(): TaskStatusText {
      return <TaskStatusText>TaskStatus[this.status];
    },
    status(): TaskStatus {
      return this.getGeneralStatus(this.id, this.statusStage);
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
