<template lang="pug">
  input.form-input(
    v-model="inputValueProxy"
    @keydown="handleKeydown"
    @focus="handleFocus"
    @blur="handleBlur"
  )
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import formatDuration from '@/utils/formatDuration';
import parseDuration from '@/utils/parseDuration';
import moment from 'moment';

@Component<DurationInput>({
  mounted() {
    this.inputValue = this.formattedValue;
    this.commit();
  },
})
export default class DurationInput extends Vue {
  /** ISO8601 duration */
  @Prop({ type: String, required: true })
  value!: string;

  /** ISO8601 duration */
  @Prop({ type: String })
  min?: string;

  /** ISO8601 duration */
  @Prop({ type: String })
  max?: string;

  $el!: HTMLInputElement;

  inputValue = '';
  hasFocus = false;

  get formattedValue(): string {
    return formatDuration(moment.duration(this.value).asMilliseconds(), true);
  }

  get inputValueProxy(): string {
    if (this.hasFocus) {
      return this.inputValue;
    }
    return this.formattedValue;
  }

  set inputValueProxy(v: string) {
    this.inputValue = v;
    this.commit();
  }

  commit(): void {
    let v = parseDuration(this.inputValue);
    if (isNaN(v)) {
      return;
    }
    if (this.maxAsMilliseconds != null && v > this.maxAsMilliseconds) {
      v = this.maxAsMilliseconds;
    }
    if (this.minAsMilliseconds != null && v < this.minAsMilliseconds) {
      v = this.minAsMilliseconds;
    }
    const value = moment.duration(v).toISOString();
    if (value !== this.value) {
      this.$emit('input', value);
    }
  }

  handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.$el.blur();
      return;
    }

    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        this.milliseconds = Math.round(this.milliseconds / 1e3 + 1) * 1e3;
        return;
      }
      case 'ArrowDown': {
        e.preventDefault();
        this.milliseconds = Math.round(this.milliseconds / 1e3 - 1) * 1e3;
        return;
      }
    }
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }
    if (e.key.length !== 1) {
      return;
    }

    // limit allowed characters
    if (
      !(
        (e.key >= '0' && e.key <= '9') ||
        e.key === ':' ||
        e.key === '.' ||
        e.key === '-'
      )
    ) {
      e.preventDefault();
    }
  }

  handleFocus(): void {
    this.hasFocus = true;
    this.$el.select();
    this.inputValue = this.formattedValue;
  }

  handleBlur(): void {
    this.hasFocus = false;
    this.commit();
  }

  get minAsMilliseconds(): number | undefined {
    if (!this.min) {
      return undefined;
    }
    return moment.duration(this.min).asMilliseconds();
  }

  get maxAsMilliseconds(): number | undefined {
    if (!this.max) {
      return undefined;
    }
    return moment.duration(this.max).asMilliseconds();
  }

  get milliseconds(): number {
    return moment.duration(this.value).asMilliseconds();
  }

  set milliseconds(v: number) {
    this.inputValueProxy = formatDuration(v, true);
  }
}
</script>
