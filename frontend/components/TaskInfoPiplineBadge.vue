<template lang="pug">
    Popover.task-info-pipeline-badge(trigger="hover" placement='bottom-end' effect='dark' v-if='model')
      TaskInfoPiplineBadgePoper(:model='model' :taskId='taskId')
      span.status(slot='reference')
        TaskInfoStatusEdit( v-if='field' :taskId='model.uuid' :field='field') {{model.pipeline}}
        TaskInfoStatus( v-else :status='generalStatus') {{model.pipeline}}
</template>

<script lang="ts">
import Vue from 'vue';

import { Popover } from 'element-ui';

import { default as TaskInfoStatusEdit } from '@/components/TaskInfoStatusEdit.vue';
import { default as TaskInfoStatus } from '@/components/TaskInfoStatus.vue';
import { default as TaskInfoPiplineBadgePoper } from '@/components/TaskInfoPiplineBadgePoper.vue';

import { TaskStatus, ICGTeamWorkTaskResponse } from '@/interface';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';

export default Vue.extend({
  props: {
    taskId: { type: String },
  },
  components: {
    Popover,
    TaskInfoStatusEdit,
    TaskInfoStatus,
    TaskInfoPiplineBadgePoper,
  },
  computed: {
    ...CGTeamWorkTaskComputedMixin,
    model(): ICGTeamWorkTaskResponse | undefined {
      return this.cgTeamworkTaskStore.storage[this.taskId];
    },
    field(): string | undefined {
      return this.permissionedFields[0];
    },
    generalStatus(): TaskStatus | null {
      if (!this.model) {
        return null;
      }
      return this.getGeneralStatus(this.model.uuid);
    },
    permissionedFields(): string[] {
      if (!(this.model && this.model.permissions)) {
        return [];
      }
      const map = this.model.permissions;
      const fields = Object.keys(map);
      return fields.filter(i => map[i]);
    },
  },
});
</script>
