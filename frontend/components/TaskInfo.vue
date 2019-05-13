<template lang="pug">
    .task-info
      TaskInfoPiplineBadge(v-for="i in tasks" :taskId="i" :key="i")
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';

import { default as TaskInfoPiplineBadge } from '@/components/TaskInfoPiplineBadge.vue';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { VideoResponse } from '@/interface';
import { videoComputedMinxin } from '@/store/video';
import {
  CGTeamWorkTaskReadActionPayload,
  CGTEAMWORK_TASK,
} from '@/mutation-types';

export default Vue.extend({
  props: {
    id: { type: String },
  },
  components: {
    TaskInfoPiplineBadge,
  },
  computed: {
    ...CGTeamWorkTaskComputedMixin,
    ...videoComputedMinxin,
    video(): VideoResponse | undefined {
      return this.videoStore.storage[this.id];
    },
    tasks(): string[] {
      if (!this.video) {
        return [];
      }
      return _.orderBy(this.video.related_tasks, this.badge_key);
    },
  },
  methods: {
    badge_key(id: string) {
      const task = this.cgTeamworkTaskStore.storage[id];
      if (!task) {
        return null;
      }
      const pipeline = task.pipeline;
      return [
        pipeline === '输出',
        pipeline === '合成',
        pipeline === '渲染',
        pipeline === '灯光',
        pipeline === '特效',
        pipeline === '解算',
        pipeline === '动画',
        pipeline === 'Layout',
        pipeline,
      ];
    },
    readTaskData() {
      if (!this.video) {
        return;
      }
      this.video.related_tasks.forEach(i => {
        const payload: CGTeamWorkTaskReadActionPayload = { id: i };
        this.$store.dispatch(CGTEAMWORK_TASK.READ, payload);
      });
    },
  },
  watch: {
    id() {
      this.readTaskData();
    },
  },
  mounted() {
    this.readTaskData();
  },
});
</script>

<style lang="scss">
.task-info {
  opacity: 0.5;
  transition: 0.2s ease-in-out;
  display: flex;
  flex-wrap: wrap;
  &:hover {
    opacity: 1;
  }
}
</style>
