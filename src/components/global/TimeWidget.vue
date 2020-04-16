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

@Component<TimeWidget>({
  components: {},
})
export default class TimeWidget extends Vue {
  @Prop({ required: true })
  public value!: string | Date;

  @Prop({})
  public format?: string;

  public text = '';
  public tickInterval: number | null = null;

  get momentValue() {
    const ret = moment(this.value);
    if (!ret.isValid()) {
      throw new Error(`Invalid date value: ${this.value}`);
    }
    return ret;
  }

  public startTick() {
    if (this.tickInterval) {
      return;
    }
    this.tickInterval = window.setInterval(() => {
      this.updateText();
    }, 10e3);
  }
  public stopTick() {
    if (!this.tickInterval) {
      return;
    }
    window.clearInterval(this.tickInterval);
  }

  @Watch('value', { immediate: true })
  public updateText() {
    this.text = this.format
      ? this.momentValue.format(this.format)
      : this.momentValue.fromNow();
  }

  public mounted() {
    if (!this.format) {
      this.startTick();
    }
  }
  public destroyed() {
    this.stopTick();
  }
}
</script>
