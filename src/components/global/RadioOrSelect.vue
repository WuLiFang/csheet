<template lang="pug">
  component(
    v-model="$_value"
    v-bind=`{
      ...$attrs,
      ...componentAttrs,
    }`
    v-on="$listeners"
  )
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import getVModelMixin from '@/mixins/VModelMixinV2';
import { Option, Entry, optionEntries } from '@/components/global/entry';

@Component<RadioOrSelect>({
  inheritAttrs: false,
  mounted() {
    this.$watch(
      () => this.value,
      v => {
        // Coerce input value to option value.
        if (
          this.optionEntries.length > 0 &&
          !this.optionEntries.some(i => i.value === v)
        ) {
          this.$emit('input', this.optionEntries[0].value);
        }
      },
      { immediate: true }
    );
  },
})
export default class RadioOrSelect extends Mixins(getVModelMixin<string>()) {
  @Prop({ type: Number, default: 5 })
  threshold!: number;

  @Prop({ type: Array, required: true })
  options!: Option<unknown>[];

  @Prop({ type: String })
  radioLabelClass?: string;

  @Prop({ type: String })
  radioInputClass?: string;

  @Prop({ type: String })
  selectDropdownClass?: string;

  get isRadio(): boolean {
    return this.options.length <= this.threshold;
  }

  get optionEntries(): Entry<unknown>[] {
    return optionEntries(this.options);
  }

  get componentAttrs(): unknown {
    return this.isRadio
      ? {
          is: 'Radio',
          options: this.options,
          labelClass: this.radioLabelClass,
          inputClass: this.radioInputClass,
        }
      : {
          is: 'Select',
          options: this.options,
          dropdownClass: this.selectDropdownClass,
        };
  }
}
</script>
