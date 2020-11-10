<template lang="pug">
  .select(
    class="relative text-left inline-block"
  )
    input(
      tabindex="-1"
      class="opacity-0 absolute pointer-events-none w-full h-full"
      ref="validationInput"
      @invalid="$emit('invalid', $event)"
      aria-hidden
    )
    template(v-if="dropdownVisible")
      input(
        ref="queryInput"
        type="search"
        class="form-input w-full"
        v-model="query"
        :placeholder="searchPlaceholder"
        @blur="blur()"
        @keydown.enter.stop="$_value = highlight; blur();"
        @keydown.up.stop="selectHighlight(-1)"
        @keydown.down.stop="selectHighlight(1)"
      )
    template(v-else)
      output.inline-block(
        ref="output"
        tabindex="0"
        class="form-select cursor-pointer w-full"
        @focus="focus()"
      ) 
        span &#8203;
        template(v-if="$_value")
          slot
            span {{ $_value }}
        span.absolute.inset-0.flex.items-center.justify-center(v-else-if="loading") 
          FaIcon.text-gray-500(name="spinner" spin)
        template(v-else) 
          slot(name="placeholder")
    transition(
      enter-active-class="transition ease-out duration-100"
      enter-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-out duration-75"
      leave-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    )
      ol(
        class="origin-top-right absolute right-0 mt-px z-30"
        class="border border-gray-700 rounded shadow-lg bg-gray-800"
        class="max-h-96 overflow-y-auto"
        :class="dropdownClass"
        aria-orientation="vertical"
        v-show="dropdownVisible"
        role="menu"
      )
        template(v-for="i in options")
          Fragment(
            tag="li"
            :render='i.render'
            :key="i.key"
            :data-key="i.key"
            ref="option"
            class="p-2 cursor-pointer"
            :class=`{
              "bg-blue-500": highlight == i.key,
            }`
            @mouseenter="highlight = i.key"
            @click="$_value = i.value; blur();"
          )
        template(
          v-if="options.length === 0"
        )
          .text-gray-500.text-center.text-md.p-2
            template(v-if="loading") 
              FaIcon.h-16(name="spinner" spin)
            template(v-else)
              slot(name="empty")
                span 无匹配
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import getVModelMixin from '@/mixins/VModelMixinV2';
import { CreateElement, VNode } from 'vue';

export type Option<T> = {
  key: string;
  value: T;
  render: (h: CreateElement) => VNode[];
};

@Component<Select>({
  mounted() {
    this.$watch(
      () => this.query,
      v => {
        this.$emit('update:query', v);
      }
    );
    this.$watch(
      () => this.value,
      (n, o) => {
        this.validateRequired();
        if (o) {
          this.$emit('change');
        }
      },
      { immediate: true }
    );
    this.$watch(
      () => this.required,
      () => {
        this.validateRequired();
      }
    );
  },
})
export default class Select extends Mixins(getVModelMixin<unknown>()) {
  @Prop({ type: Boolean, default: false })
  required!: boolean;

  @Prop({ type: String, default: '请选择' })
  requiredMessage!: string;

  @Prop({ type: Boolean, default: false })
  loading!: boolean;

  @Prop({ type: Array, required: true })
  options!: Option<unknown>[];

  @Prop({ type: String })
  searchPlaceholder?: string;

  @Prop({ type: String })
  dropdownClass?: string;

  $refs!: {
    queryInput: HTMLInputElement;
    validationInput: HTMLInputElement;
    option: HTMLLIElement[];
  };

  query = '';

  highlight = null as unknown;
  dropdownVisible = false;
  hasFocus = false;

  scrollToHighlight(): void {
    this.$refs.option
      ?.find(i => i.dataset.key === this.highlight)
      ?.scrollIntoView({
        block: 'nearest',
      });
  }

  selectHighlight(offset = 0): void {
    if (!this.options) {
      return;
    }
    let index = this.options.findIndex(i => i.key === this.highlight);
    index += offset;
    if (index < 0) {
      index = 0;
    }
    if (index > this.options.length - 1) {
      index = this.options.length - 1;
    }
    const v = this.options[index];
    if (!v) {
      return;
    }
    this.$_value = v.value;
    this.highlight = v.key;
    this.scrollToHighlight();
  }

  focus(): void {
    this.hasFocus = true;
    this.highlight = this.$_value;
    this.dropdownVisible = true;
    this.$nextTick(() => {
      this.scrollToHighlight();
      this.$refs.queryInput.focus();
    });
  }

  blur(): void {
    this.hasFocus = false;
    // delay dropdown hide so click event from dropdown can trigger.
    setTimeout(() => {
      if (this.hasFocus) {
        return;
      }
      this.dropdownVisible = false;
    }, 100);
    if (document.activeElement === this.$refs.queryInput) {
      this.$refs.queryInput.blur();
    }
  }

  setCustomValidity(v: string): void {
    this.$refs.validationInput?.setCustomValidity(v);
  }

  protected validateRequired(): void {
    if (this.required && !this.$_value) {
      this.setCustomValidity(this.requiredMessage);
    } else {
      this.setCustomValidity('');
    }
  }
}
</script>
