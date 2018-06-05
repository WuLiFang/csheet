<template lang="pug">
  .the-csheet-viewer(v-show='video')
    .overlay(@click='setVideoId(null)')
    .detail(v-if='video')
      TaskInfo(:id="video.uuid")
      FileInfo(:id="video.uuid")
    .topright
      ElButton(
        @click='refresh' 
        v-if='!isFileProtocol' 
        size='small' 
        icon='el-icon-refresh'
      ) 刷新
    video.center(
      ref='video'
      v-if='posterReady'
      :poster='poster'
      :src='preview'
      @durationchange='ondurationchange' 
      @dragstart='ondragstart' 
      draggable
      loop
    )
    .center.failed(v-else-if='posterFailed') 读取失败
    .center(v-else-if='poster')
      Spinner(size='large' message='读取中' text-fg-color='white')
    .center.failed(v-else) 不可用
    .prev(:class='{disabled: !prev}' @click='prev ? setVideoId(prev.uuid) : null')
    .next(:class='{disabled: !next}' @click='next ? setVideoId(next.uuid) : null')
    .bottom
      span.caption {{ video ? video.label : ''}}
</template>

<script lang="ts">
import Vue from 'vue';

import * as _ from 'lodash';
import Spinner from 'vue-simple-spinner';
import { Button as ElButton } from 'element-ui';

import TaskInfo from './TaskInfo.vue';
import FileInfo from './FileInfo.vue';

import { isFileProtocol } from '../packtools';
import { videoComputedMinxin } from '../store/video';
import { LoadStatus } from '../store/types';
import { VideoResponse, VideoRole } from '../interface';
import {
  VideoLoadPosterActionPayload,
  LOAD_VIDEO_POSTER,
  VideoReadActionPayload,
  VIDEO,
} from '../mutation-types';

export default Vue.extend({
  props: {
    videoId: { type: String, default: null },
  },
  data() {
    return {
      isForce: false,
      isFileProtocol,
    };
  },
  components: {
    Spinner,
    TaskInfo,
    FileInfo,
    ElButton,
  },
  computed: {
    ...videoComputedMinxin,
    poster(): string | null {
      return this.getVideoURI(this.videoId, VideoRole.poster, this.isForce);
    },
    posterReady(): boolean {
      return this.videoStore.posterStatusMap[this.videoId] === LoadStatus.ready;
    },
    posterFailed(): boolean {
      return (
        this.videoStore.posterStatusMap[this.videoId] === LoadStatus.failed
      );
    },
    preview(): string | null {
      return this.getVideoURI(this.videoId, VideoRole.preview, this.isForce);
    },
    videoList(): VideoResponse[] {
      return _.sortBy(this.videoStore.storage, v => v.label);
    },
    video(): VideoResponse {
      return this.videoStore.storage[this.videoId];
    },
    videoElement(): HTMLVideoElement | undefined {
      return this.$refs.video as HTMLVideoElement | undefined;
    },
    index(): number | null {
      if (!this.videoId) {
        return null;
      }
      return this.videoList.indexOf(this.video);
    },
    next(): VideoResponse | null {
      if (this.index === null) {
        return null;
      }
      const ret = _.find(
        this.videoList,
        value => Boolean(value.poster_mtime),
        this.index + 1,
      );
      return ret ? ret : null;
    },
    prev(): VideoResponse | null {
      if (!this.index) {
        return null;
      }
      const ret = _.findLast(
        this.videoList,
        value => Boolean(value.poster_mtime),
        this.index - 1,
      );
      return ret ? ret : null;
    },
    url(): string {
      const hash = this.video ? `#${this.video.label}` : '';
      return `${window.location.href.split('#')[0]}${hash}`;
    },
  },
  methods: {
    setVideoId(id: string | null) {
      this.$emit('update:videoId', id);
    },
    refresh() {
      const payload: VideoReadActionPayload = { id: this.videoId };
      this.isForce = true;
      this.$store.dispatch(VIDEO.READ, payload);
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
              window.location.pathname.lastIndexOf('/'),
            ),
          ) +
          '/' +
          plainData;
      }
      event.dataTransfer.setData('text/plain', plainData);
    },
    parseHash() {
      const hash = window.location.hash.slice(1);
      if (!hash) {
        return;
      }
      let index: number | null = _.findIndex(
        this.videoList,
        value => value.label === hash,
      );
      if (index < 0) {
        const match = /^image(\d+)/.exec(hash);
        index = match && Number(match[1]);
      }
      if (index) {
        this.setVideoId(this.videoList[index].uuid);
      }
    },
    setupShortcut() {
      window.addEventListener('keyup', (event: KeyboardEvent) => {
        switch (event.key) {
          case 'ArrowLeft': {
            if (this.prev) {
              this.setVideoId(this.prev.uuid);
            }
            break;
          }
          case 'ArrowRight': {
            if (this.next) {
              this.setVideoId(this.next.uuid);
            }
            break;
          }
        }
      });
    },
    loadPoster(id: string) {
      const payload: VideoLoadPosterActionPayload = { id };
      this.$store.dispatch(LOAD_VIDEO_POSTER, payload);
    },
    ondurationchange(event: Event) {
      const element = event.target as HTMLVideoElement;
      element.controls = element.duration > 0.1;
    },
  },
  watch: {
    videoId(value: string | null) {
      if (value) {
        this.scrollTo(value);
        this.loadPoster(value);
        if (this.next) {
          this.loadPoster(this.next.uuid);
        }
        if (this.prev) {
          this.loadPoster(this.prev.uuid);
        }
        window.location.replace(this.url);
      }
    },
    preview(value: string | null) {
      if (this.videoElement) {
        this.videoElement.controls = false;
        if (value) {
          this.videoElement.src = value;
        } else {
          this.videoElement.removeAttribute('src');
        }
        this.videoElement.load();
      }
    },
  },
  created() {
    this.setupShortcut();
    this.parseHash();
  },
});
</script>
<style lang="scss" scoped>
.the-csheet-viewer {
  color: white;
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  button {
    color: black;
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
      content: '<';
    }
  }
  .next {
    right: 1%;
    &:after {
      content: '>';
    }
  }
}
</style>