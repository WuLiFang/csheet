<template lang="pug">
  .the-csheet-viewer(v-show='video')
    .overlay(@click='video = null')
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
      ElCheckbox(v-model='isAutoPlay' label='自动播放' size='mini')
      ElCheckbox(v-model='isAutoNext' label='自动下一个' size='mini')
    video.center(
      ref='video'
      :poster='poster'
      :src='preview'
      @durationchange='ondurationchange' 
      @dragstart='ondragstart' 
      :autoplay='isAutoPlay'
      @ended='onended'
      draggable
      :loop='!isAutoNext'
    )
    //- .center.failed(v-else-if='posterFailed') 读取失败
    //- .center(v-else-if='poster')
    //-   Spinner(size='large' message='读取中' text-fg-color='white')
    .prev(:class='{disabled: !prev}' @click='prev ? video = prev : null')
    .next(:class='{disabled: !next}' @click='next ? video = next : null')
    .bottom
      span.caption {{ video ? video.label : ''}}
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

import * as _ from 'lodash';
import Spinner from 'vue-simple-spinner';
import { Button as ElButton, Checkbox as ElCheckbox } from 'element-ui';

import TaskInfo from './TaskInfo.vue';
import FileInfo from './FileInfo.vue';

import { isFileProtocol } from '../packtools';
import { videoComputedMinxin } from '../store/video';
import { LoadStatus } from '../store/types';
import { VideoResponse, VideoRole } from '../interface';
import {
  VideoReadActionPayload,
  VIDEO,
  PRELOAD_VIDEO,
  VideoPreloadActionPayload,
  VideoUpdateBlobWhiteListMapMutationPayload,
  UPDATE_VIDEO_BLOB_WHITELIST,
} from '../mutation-types';

export default Vue.extend({
  components: {
    Spinner,
    TaskInfo,
    FileInfo,
    ElButton,
    ElCheckbox,
  },
  props: {
    videoId: { type: String, default: null },
  },
  data() {
    return {
      videoArray: <VideoResponse[]>[],
      prev: <VideoResponse | null>null,
      next: <VideoResponse | null>null,
      index: <number | null>null,
      nextPreviewBlob: <string | null>null,
      isForce: false,
      isAutoPlay: false,
      isAutoNext: false,
      isFileProtocol,
    };
  },
  computed: {
    ...videoComputedMinxin,
    id: {
      get(): string | null {
        return this.videoId;
      },
      set(value: string | null) {
        this.$emit('update:videoId', value);
      },
    },
    poster(): string | null {
      return this.getBlobURL(this.videoId, VideoRole.poster, this.isForce);
    },
    preview(): string | null {
      return this.getBlobURL(this.videoId, VideoRole.preview, this.isForce);
    },
    video: {
      get(): VideoResponse | null {
        return this.videoStore.storage[this.videoId];
      },
      set(value: VideoResponse | null) {
        this.id = value ? value.uuid : null;
      },
    },
    videoElement(): HTMLVideoElement | undefined {
      return this.$refs.video as HTMLVideoElement | undefined;
    },
    url(): string {
      const hash = this.video ? `#${this.video.label}` : '';
      return `${window.location.href.split('#')[0]}${hash}`;
    },
  },
  methods: {
    getVisibleVideo(): VideoResponse[] {
      return _.sortBy(
        _.filter(this.videoStore.storage, i => {
          const element = this.videoElementHub.get(i.uuid);
          return element ? !element.hidden : false;
        }),
        v => v.label,
      );
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

      // By label
      const video = _.find(this.videoStore.storage, i => i.label == hash);
      if (video) {
        this.video = video;
        return;
      }

      // By index.
      const match = /^image(\d+)/.exec(hash);
      if (match) {
        this.video = this.videoArray[Number(match[1])];
      }
    },
    setupShortcut() {
      window.addEventListener('keyup', (event: KeyboardEvent) => {
        switch (event.key) {
          case 'ArrowLeft': {
            if (this.prev) {
              this.video = this.prev;
            }
            break;
          }
          case 'ArrowRight': {
            if (this.next) {
              this.video = this.next;
            }
            break;
          }
        }
      });
    },
    ondurationchange(event: Event) {
      if (this.isAutoNext) {
        return;
      }
      const element = event.target as HTMLVideoElement;
      element.controls = element.duration > 0.1;
    },
    onended() {
      if (this.isAutoNext && this.index) {
        this.video =
          _.find(
            this.videoArray,
            value => Boolean(value.preview_mtime),
            this.index + 1,
          ) ||
          _.find(this.videoArray, value => Boolean(value.preview_mtime)) ||
          this.video;
      }
    },
    updateData() {
      this.videoArray = this.getVisibleVideo();
      if (!this.video) {
        this.next = null;
        this.prev = null;
        this.index = null;
        return;
      }
      this.index = this.videoArray.indexOf(this.video);
      this.next =
        _.find(
          this.videoArray,
          value => Boolean(value.poster_mtime),
          this.index + 1,
        ) || null;
      this.prev =
        _.findLast(
          this.videoArray,
          value => Boolean(value.poster_mtime),
          this.index - 1,
        ) || null;
      const blobWhitelist = [this.video.uuid];
      if (this.prev) {
        blobWhitelist.push(this.prev.uuid);
      }
      if (this.next) {
        blobWhitelist.push(this.next.uuid);
      }
      const payload: VideoUpdateBlobWhiteListMapMutationPayload = {
        key: 'viewer',
        value: blobWhitelist,
      };
      this.$store.commit(UPDATE_VIDEO_BLOB_WHITELIST, payload);
      this.preloadVideo(this.video);
      this.preloadVideo(this.prev);
      this.preloadVideo(this.next);
    },
    preloadVideo(video: VideoResponse | null) {
      if (!video) {
        return;
      }
      let payload: VideoPreloadActionPayload = {
        id: video.uuid,
        role: VideoRole.poster,
      };
      this.$store.dispatch(PRELOAD_VIDEO, payload);
      payload.role = VideoRole.preview;
      this.$store.dispatch(PRELOAD_VIDEO, payload);
    },
  },
  watch: {
    videoId(value: string | null) {
      this.updateData();
      if (value) {
        this.scrollTo(value);
        window.location.replace(this.url);
      }
    },
    preview(value: string | null) {
      if (this.videoElement) {
        this.videoElement.controls = false;
      }
    },
  },
  mounted() {
    this.setupShortcut();
    this.parseHash();
    this.updateData();
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
    display: flex;
    flex-direction: column;
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