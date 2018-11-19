<template lang="pug">
    .task-info-pipeline-badge-poper
        span 制作者: {{model.artist}}
        TaskInfoStatusEdit(:taskId='model.id' field='leader_status')
            template(slot-scope='status') 组长状态: {{status.text}}
        TaskInfoStatusEdit(:taskId='model.id' field='director_status')
            template(slot-scope='status') 导演状态: {{status.text}}
        TaskInfoStatusEdit(:taskId='model.id' field='client_status')
            template(slot-scope='status') 客户状态: {{status.text}}
        span 备注: {{model.note_num}}
</template>


<script lang="ts">
import Vue from 'vue';

import TaskInfoStatusEdit from '@/components/TaskInfoStatusEdit.vue';
import { CGTeamWorkTaskComputedMixin } from '../store/cgteamwork-task';
import { CGTeamWorkTaskData } from '../interface';

export default Vue.extend({
  props: {
    taskId: { type: String },
  },
  components: {
    TaskInfoStatusEdit,
  },
  computed: {
    ...CGTeamWorkTaskComputedMixin,
    model(): CGTeamWorkTaskData {
      return this.cgTeamworkTaskStore.storage[this.taskId];
    },
  },
});
</script>