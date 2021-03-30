<template>
  <div class="flex flex-wrap justify-between">
    <div class="inline-flex">
      <label>
        显示标注
        <input
          v-model="isPresentationAnnotationVisible"
          type="checkbox"
          class="form-checkbox"
        />
      </label>
    </div>
    <slot name="right"></slot>
  </div>
</template>

<script lang="ts">
import { isPresentationAnnotationVisible } from '@/preference';
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'PresentationAnnotationEditorToolbar',
  props: {},
  setup: () => {
    return {
      isPresentationAnnotationVisible,
    };
  },
});
</script>
