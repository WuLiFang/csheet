<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    v-html="safeHTML"
  ></svg>
</template>

<script lang="ts">
import usePresentationMetadata from '@/composables/usePresentationMetadata';
import { Presentation } from '@/graphql/types/Presentation';
import { computed, defineComponent, PropType } from '@vue/composition-api';
import DOMPurify from 'dompurify';

export default defineComponent({
  name: 'PresentationAnnotationEditor',
  props: {
    value: {
      type: Object as PropType<Presentation>,
    },
  },
  setup: (props) => {
    const { height, width } = usePresentationMetadata(
      computed(() => props.value)
    );

    const annotation = computed(
      () => props.value?.metadata.find((i) => i.k === 'annotation')?.v ?? ''
    );

    const safeHTML = computed(
      () =>
        `\
<style>
polyline {
  stroke-linecap: round;
}
polyline,
rect,
ellipse {
  fill: none;
}
.invisible {
  visibility: hidden;
}
</style>
` + DOMPurify.sanitize(annotation.value)
    );

    return {
      height,
      width,
      safeHTML,
    };
  },
});
</script>
