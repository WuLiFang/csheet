<template lang="pug">
    .task-info-pipeline-badge-poper
        span 制作者: {{model.artist}}
        TaskInfoStatus(v-if='model.leader_status' :status='model.leader_status' )
            template(slot-scope='status') 组长状态: {{status.text}}
        TaskInfoStatus(v-if='model.director_status' :status='model.director_status' )
            template(slot-scope='status') 导演状态: {{status.text}}
        TaskInfoStatus(v-if='model.client_status' :status='model.client_status' )
            template(slot-scope='status') 客户状态: {{status.text}}
        span 备注: {{model.note_num}}
</template>


<script lang="ts">
import Vue from "vue";
import { TaskDataModel } from "../interface";

import TaskInfoStatus from "./TaskInfoStatus.vue";

export default Vue.extend({
  props: {
    model: { type: <() => TaskDataModel>Object }
  },
  components: {
    TaskInfoStatus
  }
});
</script>
<style lang="scss" scoped>
.task-info-pipeline-badge-poper {
  //   color: white;
}
</style>
