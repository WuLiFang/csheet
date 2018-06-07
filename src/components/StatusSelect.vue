<template lang="pug">
  .status-select()
    ElSwitch(
      v-for='i in allStatus'
      :active-text='taskStatusTextL10n(TaskStatus[i])' 
      :key='i' 
      v-model='select[i]'
    )
    ElSwitch(
      active-text='其他'
      v-model='select.other'
    )
</template>

<script lang="ts">
import Vue from 'vue';
import { Switch } from 'element-ui';
import { TaskStatus, TaskStatusText } from '@/interface';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { taskStatusTextL10n } from '@/statustools';

export interface StatusSelectResult {
  [TaskStatus.Close]: boolean;
  [TaskStatus.Retake]: boolean;
  [TaskStatus.Wait]: boolean;
  [TaskStatus.Check]: boolean;
  [TaskStatus.Approve]: boolean;
  other: boolean;
}

export default Vue.extend({
  props: { value: { type: Object as () => StatusSelectResult } },
  components: {
    ElSwitch: Switch,
  },
  data() {
    return {
      TaskStatus,
    };
  },
  computed: {
    ...CGTeamWorkTaskComputedMixin,
    result: {
      get(): StatusSelectResult {
        return this.value;
      },
      set(value: StatusSelectResult) {
        this.$emit('input', value);
      },
    },
    allStatus(): TaskStatusText[] {
      return Object.keys(TaskStatus).filter(
        i => !isNaN(Number.parseInt(i)),
      ) as TaskStatusText[];
    },
  },
  methods: {
    taskStatusTextL10n,
  },
});
</script>
<style lang="scss" scoped>
.status-select {
  .el-switch {
    display: block;
  }
}
</style>

<style lang="scss">
.el-switch__label {
  color: gray;
}
</style>
