<template lang="pug">
  div.viewer(v-show='video')
    div.overlay(@click='setVideo(null)')
    div.detail(v-html='video ? video.infoHTML : "<empty>"')
    video.small(:poster='poster' :src='preview' muted loop)
    div.prev(v-show='prev' @click='setVideo(prev)')
    div.next(v-show='next' @click='setVideo(next)')
    div.bottom
      span.caption {{ video ? video.label : ''}}
</template>

<script lang="ts">
import Vue from "vue";
import { CSheetVideo, Role } from "../video";
import { VideoBus } from "../csheet";
import * as _ from "lodash";

export default Vue.extend({
  props: {
    video: { type: CSheetVideo, default: null }
  },
  data() {
    return {
      note: "<div>test</div>"
    };
  },
  computed: {
    poster(): string | null {
      if (!this.video) {
        return null;
      }
      let mtime = this.video.poster_mtime;
      return this.video.getPath(Role.poster);
    },
    preview(): string | null {
      if (!this.video) {
        return null;
      }
      let mtime = this.video.preview_mtime;
      return this.video.getPath(Role.preview);
    },
    videoList(): Array<CSheetVideo> {
      return _.toArray(VideoBus);
    },
    videoElement(): HTMLVideoElement | undefined {
      return <HTMLVideoElement | undefined>this.$refs.video;
    },
    index(): number | null {
      if (!this.video) {
        return null;
      }
      return this.videoList.indexOf(this.video);
    },
    next(): CSheetVideo | null {
      if (this.index === null) {
        return null;
      }
      let ret = _.find(
        this.videoList,
        value => Boolean(value.poster_mtime),
        this.index + 1
      );
      return ret ? ret : null;
    },
    prev(): CSheetVideo | null {
      if (!this.index) {
        return null;
      }
      let ret = _.findLast(
        this.videoList,
        value => Boolean(value.poster_mtime),
        this.index - 1
      );
      return ret ? ret : null;
    }
  },
  methods: {
    setVideo(video: CSheetVideo | null) {
      this.$emit("update:video", video);
    }
  },
  watch: {
    video(value: CSheetVideo | null) {
      if (value) {
        value.loadInfo();
      }
    }
  }
});
</script>
<style lang="scss" scoped>
.viewer {
  position: fixed;
  width: 100%;
  height: 100%;
}
.overlay {
  z-index: 1;
  width: 100%;
  height: 100%;
  background: rgba(1, 1, 1, 0.5);
  cursor: zoom-out;
}
.detail {
  color: grey;
  z-index: 3;
  display: block;
  position: fixed;
  left: 0;
  top: 0;
  margin: 5px;
  background: black;
  max-height: 100%;
  overflow-y: auto;
  text-align: center;
}
video {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -52%);
  max-width: 90%;
  height: 90%;
  &:hover {
    z-index: 3;
  }
}
.bottom {
  z-index: 3;
  position: absolute;
  box-sizing: border-box;
  text-align: center;
  bottom: 0;
  width: 100%;
  margin: 0.5%;
  .caption {
    max-width: 80%;
    color: #eee;
    text-shadow: 1px 1px 0 black;
    background: rgba(0, 0, 0, 0.5);
    padding: 0.5em;
  }
}
.prev,
.next {
  color: burlywood;
  z-index: 4;
  position: fixed;
  text-decoration: none;
  font-size: 3em;
  background: rgba(255, 255, 255, 0.1);
  padding: 5% 2%;
  top: 50%;
  transition: 0.4s ease-in-out;
  transform: translate(0%, -50%);
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  cursor: pointer;
}
.prev {
  left: 1%;
  &:before {
    content: "<";
  }
}
.next {
  right: 1%;
  &:after {
    content: ">";
  }
}
</style>
<style lang="scss">
.detail {
  table {
    border-spacing: 0.5em 0.2em;
    td.status {
      color: white;
      opacity: 0.5;
      border-radius: 8px;
      &[status="Wait"] {
        background: rgb(0, 85, 127);
        &::before {
          content: "等待";
        }
      }
      &[status="Check"] {
        background: rgb(219, 219, 2);
        &::before {
          content: "检查";
        }
      }
      &[status="Retake"] {
        background: rgb(255, 0, 0);
        &::before {
          content: "返修";
        }
      }
      &[status="Approve"] {
        background: rgb(0, 206, 0);
        &::before {
          content: "通过";
        }
      }
      &[status="Close"] {
        &::before {
          content: "<关闭>";
        }
      }
    }
    td.notes {
      transition: 0.3s ease-out;
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .note-container {
    iframe {
      width: 100%;
      min-width: 350px;
      height: 320px;
      border: 0;
    }
  }
}
</style>
