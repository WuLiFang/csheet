<template lang="pug">
    .task-info-status(:status="statusText")
      slot(:text='text') {{text}}
</template>

<script lang="ts">
import Vue from "vue";
import { TaskStatus, TaskStatusText } from "../interface";

export default Vue.extend({
  props: {
    status: { type: <() => TaskStatus>Number }
  },
  computed: {
    statusText(): TaskStatusText | null {
      return <TaskStatusText>TaskStatus[this.status] || null;
    },
    text(): string {
      return this.l10n(this.statusText);
    }
  },
  methods: {
    l10n(text: TaskStatusText | null): string {
      if (!text) {
        return "未设置";
      }
      return {
        Close: "关闭",
        Wait: "等待",
        Check: "检查",
        Retake: "返修",
        Approve: "通过"
      }[text];
    }
  }
});
</script>

<style lang="scss" scoped>
$radius: 8px;

.task-info-status {
  display: inline-block;
  color: white;
  border-radius: $radius;
  padding: $radius/2 1em;
  margin: 3px;
  &[status="Wait"] {
    background: rgb(0, 85, 127);
  }
  &[status="Check"] {
    background: rgb(219, 219, 2);
  }
  &[status="Retake"] {
    background: rgb(255, 0, 0);
  }
  &[status="Approve"] {
    background: rgb(0, 206, 0);
  }
  &[status="Close"] {
    background: rgb(0, 0, 0);
  }
  &:not([status]) {
    background: rgba($color: white, $alpha: 0.2);
    color: black;
    border: 1px solid black;
  }
}
</style>
