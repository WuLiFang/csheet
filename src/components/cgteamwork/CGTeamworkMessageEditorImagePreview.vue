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
    FaIcon(
      name="times-circle"
      class="absolute top-0 right-0 h-6 m-px bg-black bg-opacity-50 rounded-full"
      @click="$emit('close')"
    )
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import "vue-awesome/icons/times-circle"
import { show } from '@/modal'
import ImageViewer from '@/components/ImageViewer.vue'

@Component<CGteamworkEditorImagePreview>({
  mounted() {
    this.$watch(() => this.value,v => {
      if (this.src){
        URL.revokeObjectURL(this.src)
      }
      this.src=  URL.createObjectURL(v)
    },{immediate: true})
  },
  destroyed() {
    if(this.src){
      URL.revokeObjectURL(this.src)
    }
  }
})
export default class CGteamworkEditorImagePreview extends Vue {
  @Prop({required: true})
  value!: File | Blob

  src = ""

  
  showImageViewer(src: string): void {
    show(ImageViewer, { attrs: { src } });
  }
}
</script>
