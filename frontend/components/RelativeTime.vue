<template lang="pug">
  time.relative-time.el-icon-time(
    v-if='moment.isValid()'
    :datetime='moment.toISOString()'
    :title='moment.format("llll:ss")'
  ) {{moment.fromNow()}}
  span(v-else) 不可用
</template>

<script lang="ts">
import moment from 'moment';
import { Vue, Prop, Component } from 'vue-property-decorator';

@Component({})
export default class RelativeTime extends Vue {
  @Prop({ type: Number })
  value!: number | string;

  get moment() {
    if (typeof this.value === 'number') {
      return moment.unix(this.value);
    }
    return moment(this.value);
  }
}
</script>


<style lang="scss" scoped>
.relative-time {
  margin: 0 1em;
}
</style>

