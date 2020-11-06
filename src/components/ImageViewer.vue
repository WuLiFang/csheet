<template lang="pug">
  transition(
    appear
    enter-class="opacity-0"
    leave-to-class="opacity-0"
    enter-active-class="transition-all duration-300 ease-in-out"
    leave-active-class="transition-all duration-300 ease-in-out"
    @after-leave="$emit('close')"
  )
    .image-viewer(
      class="fixed inset-0 z-20 bg-black bg-opacity-50"
      v-if="visible"
      class="cursor-zoom-out"
      @click="visible = false"
    )
      img(
        class="w-full h-full object-contain"
        v-bind="$attrs"
      )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component<ImageViewer>({
  inheritAttrs: false,
})
export default class ImageViewer extends Vue {
  visible = true;
}
</script>
