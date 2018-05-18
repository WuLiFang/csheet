<template lang="pug">
  .viewer(v-show='video')
    .overlay(@click='setVideo(null)')
    .detail(v-if='video')
      TaskInfo(:id="video.uuid")
      FileInfo(:id="video.uuid")
    .topright
      button(@click='refresh' v-if='!isFileProtocol') 刷新
    video.center(
      ref='video'
      v-if='posterReady'
      :poster='poster'
      :src='preview'
      @loadedmetadata='onloadedmetadata' 
      @dragstart='ondragstart' 
      draggable
      loop
    )
    .center.failed(v-else-if='posterFailed') 读取失败
    .center(v-else-if='poster')
      Spinner(size='large' message='读取中' text-fg-color='white')
    .center.failed(v-else) 不可用
    .prev(:class='{disabled: !prev}' @click='prev ? setVideo(prev) : null')
    .next(:class='{disabled: !next}' @click='next ? setVideo(next) : null')
    .bottom
      span.caption {{ video ? video.label : ''}}
</template>

<script lang="ts">
import Vue from "vue";

import * as _ from "lodash";
import Spinner from "vue-simple-spinner";

import TaskInfo from "./TaskInfo.vue";
import FileInfo from "./FileInfo.vue";

import { CSheetVideo, Role } from "../video";
import { VideoBus } from "../csheet";
import { isFileProtocol } from "../packtools";

export default Vue.extend({
  props: {
    video: { type: CSheetVideo, default: null }
  },
  data() {
    return {
      note: "<div>test</div>",
      isFileProtocol: isFileProtocol
    };
  },
  components: {
    Spinner,
    TaskInfo,
    FileInfo
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
    },
    url(): string {
      let hash = this.video ? `#${this.video.label}` : "";
      return `${window.location.href.split("#")[0]}${hash}`;
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
      let now = new Date().getTime();
      this.video.thumb_mtime = now;
      this.video.poster_mtime = now;
      this.video.preview_mtime = now;
      this.video.posterReady = false;
      this.video.loadPoster();
    },
    onloadedmetadata(event: Event) {
      let element = <HTMLVideoElement>event.target;
      element.controls = element.duration > 0.1;
    },
    ondragstart(event: DragEvent) {
      if (!this.video) {
        return;
      }
      let plainData = this.video.src || this.video.poster;
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
    parseHash() {
      let hash = window.location.hash.slice(1);
      if (!hash) {
        return;
      }
      let index: number | null = _.findIndex(
        this.videoList,
        value => value.label == hash
      );
      if (index < 0) {
        let match = /^image(\d+)/.exec(hash);
        index = match && Number(match[1]);
      }
      if (index) {
        this.setVideo(this.videoList[index]);
      }
    },
    setupShortcut() {
      window.addEventListener("keyup", (event: KeyboardEvent) => {
        switch (event.key) {
          case "ArrowLeft": {
            this.prev ? this.setVideo(this.prev) : null;
            break;
          }
          case "ArrowRight": {
            this.next ? this.setVideo(this.next) : null;
            break;
          }
        }
      });
    }
  },
  watch: {
    video(value: CSheetVideo | null) {
      if (value) {
        value.scrollToThis();
        value.loadPoster();
        if (this.next) {
          this.next.loadPoster();
        }
        if (this.prev) {
          this.prev.loadPoster();
        }

        window.location.replace(this.url);
      }
    },
    preview(value) {
      if (!value && this.videoElement) {
        this.videoElement.controls = false;
      }
    }
  },
  created() {
    this.setupShortcut();
    this.parseHash();
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

.center {
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