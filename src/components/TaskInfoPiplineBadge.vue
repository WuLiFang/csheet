<template lang="pug">
    Popover.task-info-pipeline-badge(trigger="hover" placement='bottom-end' effect='dark' v-if='model') 
      TaskInfoPiplineBadgePoper(:model='model' :taskId='taskId')
      span.status(slot='reference')
        TaskInfoStatusEdit( v-if='field' :taskId='model.id' :field='field') {{model.pipeline}}
        TaskInfoStatus( v-else :status='generalStatus') {{model.pipeline}}
</template>

<script lang="ts">
import Vue from 'vue';

import { Popover } from 'element-ui';

import TaskInfoStatusEdit from './TaskInfoStatusEdit.vue';
import TaskInfoStatus from './TaskInfoStatus.vue';
import TaskInfoPiplineBadgePoper from './TaskInfoPiplineBadgePoper.vue';

import { TaskStatus, CGTeamWorkTaskData } from '../interface';
import { StringIterator } from 'lodash';
import { CGTeamWorkTaskComputedMixin } from '../store/cgteamwork-task';
import {
  CGTeamWorkTaskReadActionPayload,
  CGTEAMWORK_TASK,
} from '@/mutation-types';

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
    model(): CGTeamWorkTaskData {
      return this.cgTeamworkTaskStore.storage[this.taskId];
    },
    field(): string | undefined {
      return this.permissionedFields[0];
    },
    generalStatus(): TaskStatus | null {
      return this.getGeneralStatus(this.model.id);
    },
    permissionedFields(): string[] {
      const map = this.model.permissions;
      const fields = Object.keys(map);
      return fields.filter(i => map[i]);
    },
  },
});
</script>

