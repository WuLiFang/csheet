<template lang="pug">
    Popover.task-info-pipeline-badge(trigger="hover" placement='bottom-end' effect='dark') 
      TaskInfoPiplineBadgePoper(:model='model')
      TaskInfoStatus(slot='reference' :status="generalStatus") {{model.pipeline}}
</template>

<script lang="ts">
import Vue from "vue";

import { Popover } from "element-ui";

import TaskInfoStatus from "./TaskInfoStatus.vue";
import TaskInfoPiplineBadgePoper from "./TaskInfoPiplineBadgePoper.vue";

import { TaskDataModel, TaskStatus } from "../interface";
export default Vue.extend({
  props: {
    model: { type: <() => TaskDataModel>Object }
  },
  components: {
    Popover,
    TaskInfoStatus,
    TaskInfoPiplineBadgePoper
  },
  computed: {
    generalStatus(): TaskStatus {
      let data = [
        this.model.leader_status,
        this.model.director_status,
        this.model.client_status
      ];
      data = data.filter(i => typeof i !== "undefined");
      return Math.min(...data);
    }
  }
});
</script>

<style lang="scss" scoped>
.task-info-pipeline-badge {
}
</style>
