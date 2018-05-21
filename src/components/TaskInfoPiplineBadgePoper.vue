<template lang="pug">
    .task-info-pipeline-badge-poper
        span 制作者: {{model.artist}}
        TaskInfoStatusEdit(:taskId='model.id' field='leader_status' :videoId='videoId')
            template(slot-scope='status') 组长状态: {{status.text}}
        TaskInfoStatusEdit(:taskId='model.id' field='director_status' :videoId='videoId')
            template(slot-scope='status') 导演状态: {{status.text}}
        TaskInfoStatusEdit(:taskId='model.id' field='client_status' :videoId='videoId')
            template(slot-scope='status') 客户状态: {{status.text}}
        span 备注: {{model.note_num}}
</template>


<script lang="ts">
import Vue from "vue";
import { TaskDataModel } from "../interface";

import TaskInfoStatusEdit from "./TaskInfoStatusEdit.vue";

export default Vue.extend({
  props: {
    model: { type: <() => TaskDataModel>Object },
    videoId: { type: String }
  },
  components: {
    TaskInfoStatusEdit
  }
});
</script>
<style lang="scss" scoped>
.task-info-pipeline-badge-poper {
  //   color: white;
}
</style>
