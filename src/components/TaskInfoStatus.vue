<template lang="pug">
    .task-info-status(:status="statusText")
      slot(:text='text') {{text}}
</template>

<script lang="ts">
import Vue from 'vue';
import { TaskStatus, TaskStatusText } from '../interface';

export default Vue.extend({
  props: {
    status: { type: Number as () => TaskStatus },
  },
  computed: {
    statusText(): TaskStatusText | null {
      return (TaskStatus[this.status] as TaskStatusText) || null;
    },
    text(): string {
      return this.l10n(this.statusText);
    },
  },
  methods: {
    l10n(text: TaskStatusText | null): string {
      if (!text) {
        return '未设置';
      }
      return {
        Close: '关闭',
        Wait: '等待',
        Check: '检查',
        Retake: '返修',
        Approve: '通过',
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
