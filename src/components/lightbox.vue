<template lang="pug">
  div.lightbox(:class='{shrink: !video.thumb_mtime}' @click='onclick' @dragstart='ondragstart' ref='lightbox' draggable='true' v-show='isVisible')
    video(:poster='thumb' muted loop)
    div
      span.caption(:style='captionStyle') {{ video.label }}
</template>


<script lang="ts">
import Vue from "vue";
import { CSheetVideo, Role } from "../video";
import { isFileProtocol } from "../packtools";
export default Vue.extend({
  props: {
    video: { type: CSheetVideo },
    isShowTitle: { default: false },
    isVisible: { default: false }
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
    },
    element(): HTMLElement {
      return <HTMLElement>this.$refs.lightbox;
    }
  },
  methods: {
    onclick() {
      this.$emit("click", this.video);
    },
    ondragstart(event: DragEvent) {
      let plainData = this.video.poster || this.video.src;
      if (!plainData) {
        return;
      }
      if (isFileProtocol) {
        plainData =
          window.location.origin +
          decodeURI(
            window.location.pathname.slice(
              0,
              window.location.pathname.lastIndexOf("/")
            )
          ) +
          "/" +
          plainData;
      }
      event.dataTransfer.setData("text/plain", plainData);
    },
    setUpVideo() {
      this.video.lightboxElement = this.element;
      this.video.isVisible = this.isVisible;
    }
  },
  watch: {
    isVisible(value) {
      this.video.isVisible = value;
    },
    video(value) {
      this.setUpVideo();
    }
  },
  mounted() {
    this.setUpVideo();
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
  &.shrink {
    background: rgba(255, 255, 255, 0.2);
    width: 10px;
    .caption {
      display: none;
    }
  }
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
