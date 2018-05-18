<template lang="pug">
    .task-info
      TaskInfoPiplineBadge(v-for="i in model" :model="i" :key="i.order") {{model}}
</template>

<script lang="ts">
import Vue from "vue";

import TaskInfoPiplineBadge from "./TaskInfoPiplineBadge.vue";
import { taskDataHub, requestTaskData } from "../hub";
import { TaskDataModel } from "../interface";

export default Vue.extend({
  props: {
    id: { type: String }
  },
  data() {
    return {
      hub: taskDataHub
    };
  },
  components: {
    TaskInfoPiplineBadge
  },
  computed: {
    model(): Array<TaskDataModel> {
      return this.hub[this.id] || [];
    }
  },
  watch: {
    id(value) {
      requestTaskData(value);
    }
  },
  mounted() {
    requestTaskData(this.id);
  }
});
</script>

<style lang="scss">
.task-info {
  opacity: 0.5;
  transition: 0.2s ease-in-out;
  &:hover {
    opacity: 1;
  }
}
</style>
