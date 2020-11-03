<template lang="pug">
  component(:is="isRadio ? 'div': 'label'" class="inline-block")
    template(v-if="isRadio")
      template(v-for="i in options")
        label.mx-1(
          :key="i.value"
        )
          input.form-radio(
            type="radio"
            :value="i.value"
            v-model="$_value"
            v-bind="$attrs"
          ) 
          span.mx-1 {{ i.label }}
    template(v-else)
      select.form-select(
        v-model="$value"
        v-bind="$attrs"
      )
        template(v-for="i in options")
          option(
            :value="i.value"
            :key="i.value"
          ) {{ i.label }}
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import getVModelMixin from '@/mixins/VModelMixinV2';

export interface RadioOrSelectOption {
  value: string;
  label: string;
}

@Component<RadioOrSelect>({
  mounted() {
    this.$watch(
      () => this.value,
      v => {
        // Coerce input value to option value.
        if (this.options.length > 0 && !this.options.some(i => i.value === v)) {
          this.$emit('input', this.options[0].value);
        }
      },
      { immediate: true }
    );
  },
})
export default class RadioOrSelect extends Mixins(getVModelMixin<string>()) {
  @Prop({ type: Array, required: true })
  options!: RadioOrSelectOption[];

  get isRadio(): boolean {
    return this.options.length <= 5;
  }
}
</script>
