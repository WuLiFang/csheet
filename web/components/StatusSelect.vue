<template lang="pug">
  .status-select()
    ElSwitch(
      v-for='i in allStatus'
      :active-text='taskStatusTextL10n(i)'
      :key='i'
      :value='result[i]'
      @input='v => oninput(i, v)'
    )
</template>

<script lang="ts">
import { TaskStatus, TaskStatusText } from '@/interface';
import { taskStatusTextL10n } from '@/statustools';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { StatusSelectResult } from '@/store/types';
import _ from 'lodash';
import Vue from 'vue';

import { Switch } from 'element-ui';

export default Vue.extend({
  components: {
    ElSwitch: Switch,
  },
  props: { value: { type: Object as () => StatusSelectResult } },

  data() {
    return {
      TaskStatus,
    };
  },

  computed: {
    ...CGTeamWorkTaskComputedMixin,
    result(): StatusSelectResult {
      return this.value;
    },
    allStatus(): TaskStatusText[] {
      return Object.keys(TaskStatus).filter(i =>
        isNaN(Number.parseInt(i, 10))
      ) as TaskStatusText[];
    },
  },
  methods: {
    taskStatusTextL10n,
    oninput(key: TaskStatusText, value: boolean) {
      this.$emit('input', { ...this.value, ...{ [key]: value } });
    },
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
