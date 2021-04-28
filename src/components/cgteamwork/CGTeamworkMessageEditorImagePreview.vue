<template lang="pug">
  .inline-block.relative(
    class="cursor-pointer"
  )
    img(
      class="w-full h-full object-contain"
      :src="src"
      class="cursor-zoom-in"
      @click="showImageViewer(src)"
    )
    svg(
      class="absolute top-0 right-0 h-6 m-px bg-black bg-opacity-25 rounded-full fill-current"
      viewBox="0 0 24 24"
      @click="$emit('close')"
    )
      path(:d="mdiCloseCircle")
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { show } from '@/modal';
import ImageViewer from '@/components/ImageViewer.vue';
import { mdiCloseCircle } from '@mdi/js';

@Component<CGteamworkEditorImagePreview>({
  data() {
    return { mdiCloseCircle };
  },
  mounted() {
    this.$watch(
      () => this.value,
      (v) => {
        if (this.src) {
          URL.revokeObjectURL(this.src);
        }
        this.src = URL.createObjectURL(v);
      },
      { immediate: true }
    );
  },
  destroyed() {
    if (this.src) {
      URL.revokeObjectURL(this.src);
    }
  },
})
export default class CGteamworkEditorImagePreview extends Vue {
  @Prop({ required: true })
  value!: File | Blob;

  src = '';

  showImageViewer(src: string): void {
    show(ImageViewer, { attrs: { src } });
  }
}
</script>
