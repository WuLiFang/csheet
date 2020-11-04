<template lang="pug">
  transition(
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
      @click="$_visible = false"
    )
      img(
        class="w-full h-full object-contain"
        v-bind="$attrs"
      )
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { ModalMixin } from '@/mixins/ModalMixin';

@Component<ImageViewer>({
  inheritAttrs: false,
})
export default class ImageViewer extends Mixins(ModalMixin) {}
</script>
