<template lang="pug">
  span.task-info-edit(v-if='response')
    TaskInfoStatus(:status='status')
      template(slot-scope='childStatus')
        slot(:text='childStatus.text') 
          | {{childStatus.text}}
    span.edit(v-show='response.has_permission')
      Button.el-icon-check(v-show='statusText != "Approve"' plain size='mini' type='success' @click='approve')
      Button.el-icon-close(v-show='statusText != "Retake"' plain size='mini' type='danger' @click='retake')
</template>

<script lang="ts">
import Vue from "vue";

import { Button, ButtonGroup, MessageBox, Message } from "element-ui";

import TaskInfoStatus from "./TaskInfoStatus.vue";
import { fieldHub, requestFieldData, FieldMap, approve, retake } from "../hub";
import { FieldResponse, TaskStatus, TaskStatusText } from "../interface";

export default Vue.extend({
  props: {
    taskId: { type: String },
    videoId: { type: String },
    field: { type: String }
  },
  components: {
    TaskInfoStatus,
    Button,
    ButtonGroup
  },
  data() {
    return {
      fieldHub
    };
  },
  computed: {
    response(): FieldResponse | undefined {
      return this.fieldMap[this.field];
    },
    fieldMap(): FieldMap {
      return this.fieldHub[this.taskId] || {};
    },
    statusText(): TaskStatusText | null {
      return this.response ? this.response.value : null;
    },
    status(): TaskStatus | null {
      return this.statusText ? TaskStatus[this.statusText] : null;
    }
  },
  methods: {
    loadData() {
      requestFieldData(this.taskId, this.field);
    },
    approve() {
      approve(this.taskId, this.field);
    },

    retake() {
      MessageBox.prompt("原因", "设为返修")
        .then((result: any) => {
          retake(this.taskId, this.field, result.value);
        })
        .catch(reason => {
          Message({ message: "取消操作" });
        });
    }
  },
  created() {
    this.loadData();
  }
});
</script>

<style lang="scss" scoped>
.task-info-edit {
  display: flex;
  align-items: center;
  .edit {
    margin: 0em;

    .el-button {
      margin: 0.1em;
    }
  }
}
</style>
