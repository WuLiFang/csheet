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
        slot
          span.mx-1 {{ i.label != null ? i.label : i.value }}
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

  @Prop({ type: String })
  labelClass?: string;

  @Prop({ type: String })
  inputClass?: string;

  @Prop({ type: String, default: () => defaults.radio.disabledClass })
  disabledClass?: string;

  get optionEntries(): Entry<unknown>[] {
    return optionEntries(this.options);
  }
}
</script>
