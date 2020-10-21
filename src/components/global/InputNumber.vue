<template lang="pug">
  input(
    v-model.lazy="valueString"
    type="number"
    @focus="$event.target.select()"
    @blur="$event.target.value = valueString"
    @keyup.enter="$event.target.blur()"
    @keyup.esc="$event.target.blur()"
    class="text-center spin-button-none"
  )
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import getVModelMixin from '@/mixins/VModelMixinV2';

@Component<InputNumber>({})
export default class InputNumber extends Mixins(
  getVModelMixin<number | undefined>()
) {
  @Prop({ type: Number })
  default?: number;

  @Prop({ type: Number })
  min?: number;

  @Prop({ type: Number })
  max?: number;

  $el!: HTMLInputElement;

  get valueString(): string {
    if (this.$_value == null) {
      return '';
    }
    return this.$_value.toString();
  }

  set valueString(v: string) {
    this.$_value = parseFloat(v);
  }

  normalizeValue(v: number | undefined): number | undefined {
    if (v == null || !isFinite(v)) {
      return this.default;
    }
    if (this.min != null && v < this.min) {
      return this.min;
    }
    if (this.max != null && v > this.max) {
      return this.max;
    }
    return v;
  }
}
</script>
