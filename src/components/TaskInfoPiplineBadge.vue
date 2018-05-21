<template lang="pug">
    Popover.task-info-pipeline-badge(trigger="hover" placement='bottom-end' effect='dark') 
      TaskInfoPiplineBadgePoper(:model='model' :videoId='videoId')
      span.status(slot='reference')
        TaskInfoStatusEdit( v-if='permissionedFields' :videoId='videoId' :taskId='model.id' :field='permissionedFields[0]') {{model.pipeline}}
        TaskInfoStatus( v-else :status='generalStatus') {{model.pipeline}}
</template>

<script lang="ts">
import Vue from "vue";

import { Popover } from "element-ui";

import TaskInfoStatusEdit from "./TaskInfoStatusEdit.vue";
import TaskInfoStatus from "./TaskInfoStatus.vue";
import TaskInfoPiplineBadgePoper from "./TaskInfoPiplineBadgePoper.vue";

import { TaskDataModel, TaskStatus } from "../interface";
import { StringIterator } from "lodash";
import { fieldHub } from "../hub";
export default Vue.extend({
  props: {
    model: { type: <() => TaskDataModel>Object },
    videoId: { type: String }
  },
  components: {
    Popover,
    TaskInfoStatusEdit,
    TaskInfoStatus,
    TaskInfoPiplineBadgePoper
  },
  data() {
    return {
      fieldHub
    };
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
    },
    permissionedFields(): Array<string> {
      let map = this.fieldHub[this.videoId];
      if (!map) {
        return [];
      }
      let fields = Object.keys(map);
      return fields.filter(i => map[i].has_permission);
    }
  }
});
</script>

