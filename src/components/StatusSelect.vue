<template lang="pug">
  .status-select()
    ElSwitch(
      v-for='i in allStatus'
      :active-text='taskStatusTextL10n(TaskStatus[i])' 
      :key='i' 
      v-model='result[i]'
      @input='v => oninput(i, v)'
    )
    ElSwitch(
      active-text='其他'
      v-model='result.other'
    )
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import { Switch } from 'element-ui';
import { TaskStatus, TaskStatusText } from '@/interface';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { taskStatusTextL10n } from '@/statustools';
import { StatusSelectResult } from '@/store/types';

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
    result(): StatusSelectResult {
      return this.value;
    },
    allStatus(): TaskStatusText[] {
      return Object.keys(TaskStatus).filter(
        i => !isNaN(Number.parseInt(i)),
      ) as TaskStatusText[];
    },
  },
  methods: {
    taskStatusTextL10n,
    oninput(key: keyof StatusSelectResult, value: boolean) {
      const val = _.clone(this.value);
      val[key] = value;
      this.$emit('input', val);
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
