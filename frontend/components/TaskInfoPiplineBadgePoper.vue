<template lang="pug">
    .task-info-pipeline-badge-poper(v-if='model')
        .artists
          span 制作者:
          span.artist(v-for='i in model.artists') {{i}}
        TaskInfoStatusEdit(:taskId='model.uuid' field='leader_status')
            template(slot-scope='status') 组长状态: {{status.text}}
        TaskInfoStatusEdit(:taskId='model.uuid' field='director_status')
            template(slot-scope='status') 导演状态: {{status.text}}
        TaskInfoStatusEdit(:taskId='model.uuid' field='client_status')
            template(slot-scope='status') 客户状态: {{status.text}}
        span 备注: {{model.note_num}}
</template>


<script lang="ts">
import Vue from 'vue';

import { default as TaskInfoStatusEdit } from '@/components/TaskInfoStatusEdit.vue';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { CGTeamWorkTaskResponse } from '@/interface';

export default Vue.extend({
  props: {
    taskId: { type: String },
  },
  components: {
    TaskInfoStatusEdit,
  },
  computed: {
    ...CGTeamWorkTaskComputedMixin,
    model(): CGTeamWorkTaskResponse | undefined {
      return this.cgTeamworkTaskStore.storage[this.taskId];
    },
  },
});
</script>
<style lang="scss" scoped>
.artist {
  margin: 0 0.2em;
}
</style>
