<template lang="pug">
  .lightbox(
    :class='{shrink: (!video.thumb_mtime || forceShrink)}'
    @click='onclick'
    @dragstart='ondragstart'
    @mouseenter="onmouseenter" 
    @mouseleave="onmouseleave" 
    :hidden='!isVisible'
    v-show='isVisible'
    draggable
  )
    video(
      ref='video'
      :poster='thumb' 
      :src='preview' 
      @loadeddata="onloadeddata"
      muted 
      loop 
    )
    div
      span.caption(:style='captionStyle') {{ video.label }}
</template>


<script lang="ts">
import Vue from "vue";

import { isFileProtocol } from "../packtools";
import { videoComputedMinxin } from "../store/video";
import { VideoResponse, VideoRole } from "../interface";
import {
  VideoSetVisibilityMutationPayload,
  SET_VIDEO_VISIBILITY,
  VideoUpdateAppearingMutationPayload,
  VideoUpdatePositionMutationPayload,
  UPDATE_VIDEO_POSITION
} from "../mutation-types";
import { PositionData } from "@/store/types";
export default Vue.extend({
  props: {
    id: { type: String },
    isShowTitle: { default: false },
    isVisible: { default: false }
  },
  data() {
    return {
      isLoadVideo: false,
      isAutoplay: false,
      forceShrink: false
    };
  },
  computed: {
    ...videoComputedMinxin,
    top(): number {
      return this.$el.offsetTop;
    },
    video(): VideoResponse {
      return this.videoStore.storage[this.id];
    },
    thumb(): string | null {
      return this.getVideoURI(this.id, VideoRole.thumb);
    },
    preview(): string | null {
      if (this.isLoadVideo) {
        return this.getVideoURI(this.id, VideoRole.preview);
      }
      return null;
    },
    captionStyle(): Object {
      if (this.isShowTitle) {
        return {
          transform: "none"
        };
      }
      return {};
    },
    videoElement(): HTMLVideoElement {
      return this.$refs.video as HTMLVideoElement;
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
    play() {
      if (this.videoElement.readyState > 1) {
        this.videoElement.play();
      }
    },
    onmouseenter() {
      this.isLoadVideo = true;
      this.isAutoplay = true;
      this.play();
    },
    onmouseleave() {
      this.isAutoplay = false;
      this.videoElement.pause();
    },
    onloadeddata() {
      if (this.isAutoplay) {
        this.play();
      }
    }
  },
  watch: {
    preview(value) {
      this.videoElement.load();
      if (!value) {
        this.isLoadVideo = false;
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.videoElementHub.set(this.id, this.$el);
    });
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
