<template>
  <ol class="inline-block mr-1">
    <template v-for="tag in value">
      <li :key="tag" class="inline-block bg-gray-700 px-2 rounded m-px">
        <span class="">{{ tag }}</span>
      </li>
    </template>
  </ol>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';

export default defineComponent({
  name: 'CollectionTags',
  props: {
    value: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  setup: () => {
    return {};
  },
});
</script>
