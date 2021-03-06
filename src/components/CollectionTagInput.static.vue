<template>
  <Dropdown :visible="matched.length > 0 && hasFocus">
    <output
      ref="output"
      :tabindex="hasFocus ? undefined : 0"
      class="form-input inline-block w-full"
      :class="{
        ['form-focus']: hasFocus,
        [outputClass]: true,
      }"
      @focus="focus()"
    >
      <template v-if="multiple">
        <ol class="inline-block mr-1">
          <template v-for="tag in values">
            <li :key="tag" class="inline-block bg-gray-700 rounded px-1 m-px">
              <span class="mx-1 align-middle">{{ tag }}</span>
              <button
                type="button"
                tabindex="-1"
                @click.prevent="_handleDeleteButtonClick(tag)"
              >
                <svg class="h-4 fill-current inline-block" viewBox="0 0 24 24">
                  <path :d="mdiClose" />
                </svg>
              </button>
            </li>
          </template>
        </ol>
      </template>
      <input
        ref="input"
        v-model="formData.value"
        tabindex="-1"
        class="bg-transparent"
        :class="[inputClass]"
        :placeholder="placeholder"
        @keyup.up.exact.prevent="highlightIndex -= 1"
        @keyup.down.exact.prevent="highlightIndex += 1"
        @keyup.esc.exact.prevent="
          formData.value = '';
          blur();
        "
        @keypress.enter.exact.prevent="_handleInputEnter"
        @blur="blur()"
        @focus="focus()"
      />
      <button
        v-show="clearable && values.length > 0"
        type="button"
        tabindex="-1"
        class="float-right"
        @click="values = []"
      >
        <svg class="fill-current h-6 inline-block" viewBox="0 0 24 24">
          <path :d="mdiClose" />
        </svg>
      </button>
    </output>
    <template #dropdown>
      <ol
        class="max-h-96 overflow-y-auto"
        aria-orientation="vertical"
        role="menu"
      >
        <li
          v-for="i in matched"
          :key="i"
          class="cursor-pointer"
          :class="{
            'bg-blue-500': i === highlight,
          }"
          @click.prevent="_handleOptionClick(i)"
          @pointerdown.prevent
          @pointerenter="highlight = i"
        >
          {{ i }}
        </li>
      </ol>
    </template>
  </Dropdown>
</template>

<script lang="ts">
import useDebounced from '@/composables/useDebounced';
import useNormalizedValues from '@/composables/useNormalizedValues';
import useSelect from '@/composables/useSelect';
import { recentTags } from '@/preference';
import containsDeepChildNode from '@/utils/containsDeepChildNode';
import { mdiClose } from '@mdi/js';
import {
  computed,
  defineComponent,
  PropType,
  reactive,
  ref,
  toRefs,
  watch,
} from '@vue/composition-api';
import { uniq } from 'lodash';
import { PAGE_DATA } from '@/page-data.static';
import extractNodes from '@/utils/extractNodes';

export default defineComponent({
  name: 'CollectionTagInput',
  emits: ['input', 'change', 'focus', 'blur'],
  props: {
    value: {
      type: [String, Array] as PropType<string | string[]>,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    inputClass: {
      type: String,
      default: '',
    },
    outputClass: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '编辑收藏标签',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { mdiClose };
  },
  setup: (props, ctx) => {
    const { multiple } = toRefs(props);
    const defaultValue = computed(() => (multiple.value ? [] : ''));
    const value = computed({
      get() {
        return props.value ?? defaultValue.value;
      },
      set(v: string | string[]) {
        ctx.emit('input', v);
      },
    });
    const { values, addValue: _addValue } = useNormalizedValues({
      value,
      multiple,
    });
    const addValue = (v: string) => {
      if (!v) {
        return;
      }
      recentTags.value = uniq([v, ...recentTags.value]).slice(0, 32);
      if (values.value.includes(v)) {
        return;
      }
      _addValue(v);
    };
    const input = ref<HTMLInputElement | undefined>();
    const output = ref<HTMLOutputElement | undefined>();
    const formData = reactive({
      value: '',
    });

    const allTags = computed(() =>
      uniq(extractNodes(PAGE_DATA.value.collections).flatMap((i) => i.tags))
    );

    const matched = computed(() => {
      const options = (() => {
        if (!formData.value && recentTags.value.length > 0) {
          return recentTags.value;
        }
        return allTags.value.filter((i) => i.includes(formData.value));
      })();
      return options.filter((i) => !values.value.includes(i));
    });
    const { selected: highlight, selectedIndex: highlightIndex } = useSelect(
      matched
    );
    const hasFocus = ref(false);
    watch(hasFocus, (v) => {
      if (v) {
        input.value?.focus();
        ctx.emit('focus');
      } else {
        if (
          output.value &&
          document.activeElement instanceof HTMLElement &&
          containsDeepChildNode(output.value, document.activeElement)
        ) {
          document.activeElement.blur();
        }
        formData.value = '';
        ctx.emit('blur');
      }
    });
    const debouncedHasFocus = useDebounced(hasFocus);
    const focus = () => {
      debouncedHasFocus.value = true;
    };
    const blur = () => {
      debouncedHasFocus.value = false;
    };
    return {
      matched,
      input,
      output,
      formData,
      highlight,
      highlightIndex,
      blur,
      focus,
      hasFocus,
      values,
      addValue,
    };
  },
  methods: {
    removeValue(v: string) {
      this.values = this.values.filter((i) => i !== v);
    },
    _handleDeleteButtonClick(value: string) {
      this.removeValue(value);
      this.focus();
    },
    _handleInputEnter() {
      if (this.highlight) {
        this.addValue(this.highlight);
      } else if (this.formData.value) {
        this.addValue(this.formData.value);
        this.formData.value = '';
      } else if (!this.multiple) {
        this.blur();
      }
    },
    _handleOptionClick(option: string) {
      this.addValue(option);
      if (this.multiple) {
        this.highlightIndex = -1;
        this.focus();
      } else {
        this.blur();
      }
    },
  },
});
</script>
