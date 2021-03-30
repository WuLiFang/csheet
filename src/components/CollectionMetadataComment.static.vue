<template>
  <component :is="tag">
    <template v-if="text.length > 0">
      <p>{{ text }}</p>
    </template>
    <template v-else>
      <p class="text-gray-500 text-sm">无留言</p>
    </template>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api';
import { Collection } from '../graphql/types/Collection';

const METADATA_KEY = 'comment';

export default defineComponent({
  name: 'CollectionMetadataComment',
  props: {
    value: {
      type: Object as PropType<Collection>,
    },
    tag: {
      type: String,
      default: 'div',
    },
  },
  setup: (props) => {
    const text = computed(
      () => props.value?.metadata.find((i) => i.k === METADATA_KEY)?.v || ''
    );
    return {
      text,
    };
  },
});
</script>
