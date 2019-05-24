<template lang="pug">
    .task-info-status(:status="statusText")
      slot(:text='text') {{text}}
</template>

<script lang="ts">
import { TaskStatus, TaskStatusText } from '@/interface';
import Vue from 'vue';

export default Vue.extend({
  props: {
    status: { type: Number as () => TaskStatus },
  },

  computed: {
    statusText(): TaskStatusText {
      return TaskStatus[this.status] as TaskStatusText;
    },
    text(): string {
      return this.l10n(this.statusText);
    },
  },

  methods: {
    l10n(text: TaskStatusText): string {
      return {
        Approve: '通过',
        Check: '检查',
        Close: '关闭',
        Retake: '返修',
        Unset: '未设置',
        Wait: '等待',
      }[text];
    },
  },
});
</script>

<style lang="scss" scoped>
@import '@/status-color.scss';

$radius: 8px;

.task-info-status {
  display: inline-block;
  color: white;
  border-radius: $radius;
  padding: $radius/2 1em;
  margin: 3px;
  @include background-by-status;
}
</style>
