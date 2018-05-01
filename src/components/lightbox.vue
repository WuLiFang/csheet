<template lang="pug">
  div.lightbox(@click='onclick' ref='lightbox')
    video(:poster='thumb' :src='preview' muted loop  )
    div
      span.caption(:style='captionStyle') {{ video.label }}
</template>


<script lang="ts">
import Vue from "vue";
import { CSheetVideo, Role } from "../video";
export default Vue.extend({
  props: {
    video: { type: CSheetVideo },
    isShowTitle: { default: false }
  },
  computed: {
    thumb(): string | null {
      let mtime = this.video.thumb_mtime;
      return this.video.getPath(Role.thumb);
    },
    preview(): string | null {
      let mtime = this.video.preview_mtime;
      return this.video.getPath(Role.preview);
    },
    captionStyle(): Object {
      if (this.isShowTitle) {
        return {
          transform: "none"
        };
      }
      return {};
    }
  },
  methods: {
    onclick() {
      this.$emit("click", this.video);
    }
  },
  mounted() {
    let element = <HTMLElement>this.$refs.lightbox;
    this.video.lightboxElement = element;
  }
});
</script>

<style lang='scss' scoped>
.lightbox {
  color: white;
  position: relative;
  height: 200px;
  margin: 5px;
  overflow: hidden;
  video {
    max-width: 100%;
    max-height: 100%;
  }
  &:hover {
    .caption {
      transform: none;
    }
  }
  cursor: zoom-in;
  transition: 0.5s ease-in-out;
}
.caption {
  position: absolute;
  bottom: 0;
  width: 100%;
  max-height: 30%;
  padding: 0.1em;
  background: rgba(1, 1, 1, 0.5);
  text-align: center;
  word-break: break-all;
  text-overflow: ellipsis;
  transition: 0.3s ease-in-out;
  transform: translateY(100%);
}
</style>
