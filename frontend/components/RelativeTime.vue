<template lang="pug">
    span.relative-time.el-icon-time {{fromNow}}
</template>

<script lang="ts">
import Vue from 'vue';
import * as moment from 'moment';

export default Vue.extend({
  props: { timestamp: { type: Number } },
  computed: {
    fromNow(): string {
      if (!this.timestamp) {
        return '未知';
      }
      return moment(this.timestamp * 1000).fromNow();
    },
  },
});
</script>
<style lang="scss" scoped>
.relative-time {
  margin: 0 1em;
}
</style>

