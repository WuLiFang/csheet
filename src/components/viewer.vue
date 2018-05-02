<template lang="pug">
  div.viewer(v-show='video')
    div.overlay(@click='setVideo(null)')
    div.detail(v-html='video ? video.infoHTML : "<empty>"')
    div.topright
      button(@click='refresh') 刷新
    video.small(:poster='poster' :src='preview' muted loop v-if='posterReady')
    span.placeholder.failed(v-else-if='posterFailed') 读取失败
    span.placeholder(v-else-if='poster') 读取中
    span.placeholder(v-else) 不可用
    div.prev(:class='{disabled: !prev}' @click='prev ? setVideo(prev) : null')
    div.next(:class='{disabled: !next}' @click='next ? setVideo(next) : null')
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
    posterReady(): boolean {
      return Boolean(this.poster && this.video && this.video.posterReady);
    },
    posterFailed(): boolean {
      return Boolean(this.poster && this.video && this.video.posterFailed);
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
    },
    refresh() {
      if (!this.video) {
        return;
      }
      this.video.loadPoster();
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
* {
  color: white;
}
button {
  color: black;
}
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
.failed {
  color: lightcoral;
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
.topright {
  position: fixed;
  right: 0;
  top: 0;
  margin: 0.5%;
}
video,
.placeholder {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -52%);
  max-width: 90%;
  max-height: 90%;
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
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
