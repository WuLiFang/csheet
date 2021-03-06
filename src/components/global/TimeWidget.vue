<template lang="pug">
  time.time-widget(
    v-if='value'
    :datetime='momentValue.toISOString()'
    :title='momentValue.toDate().toLocaleString(undefined, { hour12: false })') 
    slot(:value='momentValue') {{ text }}
</template>

<script lang="ts">
import moment from 'moment';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import humanizeTime from '@/utils/humanizeTime';

@Component<TimeWidget>({
  components: {},
  mounted() {
    if (!this.format) {
      this.startTick();
    }
  },
  destroyed() {
    this.stopTick();
  },
})
export default class TimeWidget extends Vue {
  @Prop({ required: true })
  public value!: string | Date;

  @Prop({})
  public format?: string;

  public text = '';
  public tickInterval: number | null = null;

  get momentValue(): moment.Moment {
    const ret = moment(this.value);
    if (!ret.isValid()) {
      throw new Error(`Invalid date value: ${this.value}`);
    }
    return ret;
  }

  @Watch('value', { immediate: true })
  public updateText(): void {
    this.text = this.format
      ? this.momentValue.format(this.format)
      : humanizeTime(this.momentValue.toDate());
  }

  public startTick(): void {
    if (this.tickInterval) {
      return;
    }
    this.tickInterval = window.setInterval(() => {
      this.updateText();
    }, 10e3);
  }

  public stopTick(): void {
    if (!this.tickInterval) {
      return;
    }
    window.clearInterval(this.tickInterval);
  }
}
</script>
