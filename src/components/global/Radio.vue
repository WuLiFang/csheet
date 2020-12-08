<template lang="pug">
  .inline-block
    template(v-for="i in optionEntries")
      label.mx-1(
        :key="i.key"
        :class=`{
          [labelClass]: true,
          [disabledClass]: i.disabled,
        }`
      )
        input.form-radio(
          type="radio"
          :value="i.value"
          v-model="$_value"
          v-bind="$attrs"
          @focus="$emit('focus')"
          :class="inputClass"
          :disabled="i.disabled"
        )
        slot(v-bind="entryContext(i)")
          span.mx-1.align-middle {{ i.label != null ? i.label : i.value }}
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import getVModelMixin from '@/mixins/VModelMixinV2';
import { Option, Entry, optionEntries } from './entry';
import defaults from './defaults';

@Component<Radio>({})
export default class Radio extends Mixins(getVModelMixin<unknown>()) {
  @Prop({ type: Array, required: true })
  options!: Option<unknown>[];

  @Prop({ type: String, default: "inline-block" })
  labelClass!: string;

  @Prop({ type: String })
  inputClass?: string;

  @Prop({ type: String, default: () => defaults.radio.disabledClass })
  disabledClass?: string;

  @Prop({ type: Function, default: (a: unknown, b: unknown) => a === b })
  equalValue!: (a: unknown, b: unknown) => boolean;

  get optionEntries(): Entry<unknown>[] {
    return optionEntries(this.options);
  }

  protected entryContext(
    v: Entry<unknown>,
    location?: string
  ): {
    key_: string;
    value: unknown;
    label?: string;
    disbaled?: boolean;
    selected: boolean;
    location?: string;
  } {
    return {
      selected: this.equalValue(this.value, v.value),
      key_: v.key,
      value: v.value,
      label: v.label,
      disbaled: v.disabled,
      location,
    };
  }
}
</script>
