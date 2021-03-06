<template lang="pug">
  Dropdown.select(
    :visible="dropdownVisible"
    :dropdown-class="dropdownClass"
  )
    output.inline-block(
      ref="output"
      :tabindex="dropdownVisible || disabled ? undefined : 0"
      class="form-select cursor-pointer w-full relative whitespace-no-wrap"
      :class=`{
        'bg-none': clearButtonVisible,
        [outputClass]: true,
        [disabledClass]: disabled,
      }`
      @focus="focus()"
    )
      template(v-if="values.length > 0")
        slot(
          name="output"
          :selected="selected"
        )
          template(v-for="i in selected")
            template(v-if="multiple")
              .inline-block(
                :key="i.key"
                class="border bg-gray-200 pl-1 pr-6 mr-1 rounded relative"
              )
                slot(v-bind="entryContext(i, 'output')")
                  span {{ i.label != null ? i.label : i.value }}
                button(
                  tabindex="-1"
                  class="absolute right-0 top-0 h-full pr-1"
                  class="text-gray-400 outline-none"
                  type="button"
                )
                  svg.w-4.fill-current(
                    viewBox="0 0 24 24"
                    @click="toggle(i.key, false)"
                  )
                    path(:d="mdiCloseCircle")
            template(v-else)
              slot(v-bind="entryContext(i, 'output')")
                span {{ i.label != null ? i.label : i.value }}
      template(v-else)
        slot(name="placeholder")
          span.text-gray-500.text-sm {{ placeholder }}
      template(v-if="clearButtonVisible")
        button.block(
          type="button"
          tabindex="-1"
          class="absolute top-0 bottom-0 right-0 px-2"
          class="cursor-pointer text-gray-500"
          class="flex items-center"
          class="outline-none"
          @click.prevent="clear(); blur();"
          title="清空"
        )
          svg.w-6.fill-current(
            viewBox="0 0 24 24"
          )
            path(:d="mdiClose")
    template(#dropdown)
      slot(
        name="search"
        :inputListeners="inputListeners"
      )
      ol(
        class="max-h-96 overflow-y-auto"
        aria-orientation="vertical"
        role="menu"
      )
        template(v-for="i in optionEntries")
          li(
            ref="option"
            :key="i.key"
            :data-key="i.key"
            class="p-2 cursor-pointer relative"
            :class=`{
              [highlightClass]: highlight == i.key,
              [disabledClass]: i.disabled,
            }`
            @pointerenter="highlight = i.key"
            @pointerdown.prevent
            @click.prevent="handleOptionClick(i)"
          )
            slot(
              v-bind="entryContext(i)"
              :option="i"
            )
              span {{ i.label != null ? i.label : i.value }}
            slot(
              name="suffix"
              v-bind="entryContext(i)"
              :option="i"
            )
              template(v-if="multiple && selectedKeys.has(i.key)")
                .flex(
                  class="absolute top-0 right-0 p-2 bottom-0 items-center"
                  class="text-gray-500"
                )
                  svg.w-6.fill-current(
                    viewBox="0 0 24 24"
                  )
                    path(:d="mdiCheck")
        template(
          v-if="options.length === 0"
        )
          .text-gray-500.text-center.text-md.p-2
            template(v-if="loading")
              svg.w-16.h-16.animate-spin.fill-current(
                class="inline-block"
                viewBox="0 0 24 24"
              )
                path(:d="mdiLoading")
            template(v-else)
              slot(name="empty")
                span 无匹配
    input(
      tabindex="-1"
      class="opacity-0 absolute inset-0 pointer-events-none w-full h-full"
      ref="transparentInput"
      @invalid="$emit('invalid', $event)"
      aria-hidden="true"
      value=""
      v-on="hasSearch ? undefined : inputListeners"
    )
</template>

<script lang="ts">
import defaults from '@/components/global/defaults';
import containsDeepChildNode from '@/utils/containsDeepChildNode';
import equalSet from '@/utils/equalSet';
import toHotKey from '@/utils/toHotKey';
import cast from 'cast-unknown';
import { uniqBy } from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Entry, Option, optionEntries } from './entry';
import {
  mdiLoading,
  mdiCheck,
  mdiClose,
  mdiCloseCircle,
  mdiChevronDown,
} from '@mdi/js';

@Component<Select>({
  data() {
    return {
      mdiChevronDown,
      inputListeners: {
        keydown: (e: KeyboardEvent) => {
          switch (toHotKey(e)) {
            case 'ArrowUp':
              e.preventDefault();
              this.offsetHighlight(-1);
              if (!this.multiple) {
                this.toggle(this.highlight, true);
              }
              break;
            case 'ArrowDown':
              e.preventDefault();
              this.offsetHighlight(1);
              if (!this.multiple) {
                this.toggle(this.highlight, true);
              }
              break;
            case 'Enter':
              e.preventDefault();
              if (!this.multiple) {
                this.toggle(this.highlight, true);
                this.blur();
              } else {
                this.toggle(this.highlight);
              }
              break;
          }
        },
        blur: () => this.blur(),
        focus: (e: Event) => {
          this.focus();
          const el = e.target;
          if (el instanceof HTMLInputElement) {
            el.setSelectionRange(0, el.value.length);
          }
        },
      },
      mdiLoading,
      mdiCheck,
      mdiClose,
      mdiCloseCircle,
    };
  },
  mounted() {
    this.$watch(
      () => this.value,
      () => {
        this.validateRequired();
        this.updateSelectedKeys();
      },
      { immediate: true }
    );
    this.$watch(
      () => this.required,
      () => {
        this.validateRequired();
      }
    );
    this.$watch(
      () => this.options,
      () => {
        this.updateSelectedKeys();
      }
    );
    this.$watch(
      () => this.selectedKeys,
      (n) => {
        this.values = this.entries
          .filter((i) => n.has(i.key))
          .map((i) => i.value);
      }
    );
  },
})
export default class Select extends Vue {
  @Prop()
  value!: unknown;

  @Prop({ type: Boolean, default: false })
  required!: boolean;

  @Prop({ type: String, default: '请选择' })
  requiredMessage!: string;

  @Prop({ type: String, default: '请选择' })
  placeholder!: string;

  @Prop()
  nullValue?: unknown;

  @Prop({ type: Boolean, default: false })
  multiple!: boolean;

  @Prop({ type: Boolean, default: false })
  clearable!: boolean;

  @Prop({ type: Boolean, default: false })
  disabled!: boolean;

  @Prop({ type: Boolean, default: false })
  loading!: boolean;

  @Prop({ type: Array, required: true })
  options!: Option<unknown>[];

  @Prop({ type: String })
  dropdownClass?: string;

  @Prop({ type: String, default: 'h-full' })
  outputClass!: string;

  @Prop({ type: String, default: () => defaults.select.highlightClass })
  highlightClass!: string;

  @Prop({ type: String, default: () => defaults.select.disabledClass })
  disabledClass!: string;

  @Prop({ type: String, default: '__input:' })
  inputKeyPrefix!: string;

  $refs!: {
    transparentInput: HTMLInputElement;
    option: HTMLLIElement[];
  };

  highlight = '';
  dropdownVisible = false;
  selectedKeys = new Set<string>();
  hasFocus = false;

  get values(): unknown[] {
    return (this.multiple ? cast.array(this.value) : [this.value]).filter(
      (i) => i !== '' && i != null
    );
  }

  set values(v: unknown[]) {
    this.$emit(
      'input',
      this.multiple && v.length > 0 ? v : v[0] ?? this.nullValue
    );
  }

  get optionEntries(): Entry<unknown>[] {
    return optionEntries(this.options);
  }

  get valueEntries(): Entry<unknown>[] {
    return this.values.map(
      (i, index) =>
        this.optionEntries.find((o) => o.value === i) ?? {
          key: `${this.inputKeyPrefix}${index}`,
          value: i,
        }
    );
  }

  get entries(): Entry<unknown>[] {
    return uniqBy([...this.optionEntries, ...this.valueEntries], (i) => i.key);
  }

  get selected(): Entry<unknown>[] {
    return this.entries.filter((i) => this.selectedKeys.has(i.key));
  }

  get clearButtonVisible(): boolean {
    return (this.multiple || this.clearable) && this.selected.length > 0;
  }

  get hasSearch(): boolean {
    return !!this.$scopedSlots.search;
  }

  scrollToHighlight(): void {
    this.$refs.option
      ?.find((i) => i.dataset.key === this.highlight)
      ?.scrollIntoView({
        block: 'nearest',
      });
  }

  offsetHighlight(offset: number): void {
    if (!this.optionEntries) {
      return;
    }
    let index = this.optionEntries.findIndex((i) => i.key === this.highlight);
    index += offset;
    if (index < 0) {
      index = 0;
    }
    if (index > this.optionEntries.length - 1) {
      index = this.optionEntries.length - 1;
    }
    const v = this.optionEntries[index];
    if (!v) {
      return;
    }
    this.highlight = v.key;
    this.scrollToHighlight();
  }

  focus(): void {
    if (this.hasFocus) {
      return;
    }
    this.hasFocus = true;

    this.highlight = this.valueEntries[0]?.key ?? '';
    this.dropdownVisible = true;
    this.$nextTick(() => {
      if (!this.hasFocus) {
        return;
      }
      this.scrollToHighlight();
      if (!this.hasSearch) {
        this.$refs.transparentInput.focus();
      }

      this.$emit('focus');
    });
  }

  blur(): void {
    if (!this.hasFocus) {
      return;
    }
    if (
      document.activeElement instanceof HTMLElement &&
      containsDeepChildNode(this.$el, document.activeElement)
    ) {
      document.activeElement.blur();
    }
    this.hasFocus = false;
    this.dropdownVisible = false;
    this.$emit('blur');
  }

  setCustomValidity(v: string): void {
    this.$refs.transparentInput?.setCustomValidity(v);
  }

  toggle(
    key: string,
    force?: boolean,
    onchange?: (newKeys: Set<string>, oldKeys: Set<string>) => void
  ): void {
    const selected = this.selectedKeys.has(key);
    const wanted = force ?? !selected;
    if (wanted === selected) {
      return;
    }

    const keys = new Set(this.multiple ? this.selectedKeys : undefined);
    if (wanted === true) {
      keys.add(key);
    } else if (wanted === false) {
      keys.delete(key);
    }
    const oldKeys = this.selectedKeys;
    this.selectedKeys = keys;
    onchange?.(keys, oldKeys);
  }

  clear(): void {
    this.selectedKeys = new Set();
    this.$emit('clear');
  }

  protected validateRequired(): void {
    if (this.required && this.values.length === 0) {
      this.setCustomValidity(this.requiredMessage);
    } else {
      this.setCustomValidity('');
    }
  }

  protected handleOptionClick(v: Entry<unknown>): void {
    if (v.disabled) {
      return;
    }
    const onchange = () => {
      this.$emit('change');
    };
    if (this.multiple) {
      this.toggle(v.key, undefined, onchange);
    } else {
      this.toggle(v.key, true, onchange);
      this.blur();
    }
  }

  protected entryContext(
    v: Entry<unknown>,
    location?: string
  ): {
    key_: string;
    value: unknown;
    label?: string;
    disbaled?: boolean;
    highlight: boolean;
    selected: boolean;
    multiple: boolean;
    toggle: Select['toggle'];
    location?: string;
  } {
    return {
      highlight: this.highlight === v.key,
      selected: this.selectedKeys.has(v.key),
      toggle: this.toggle.bind(this),
      multiple: this.multiple,
      key_: v.key,
      value: v.value,
      label: v.label,
      disbaled: v.disabled,
      location,
    };
  }

  protected updateSelectedKeys(): void {
    const keys = new Set(this.valueEntries.map((i) => i.key));
    if (!equalSet(this.selectedKeys, keys)) {
      this.selectedKeys = keys;
    }
  }
}
</script>
