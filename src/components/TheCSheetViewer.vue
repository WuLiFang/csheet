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
      .video-control(v-show='src')
        ElCheckbox(v-model='isEnablePreviewModel' label='视频' size='mini')
        ElCheckbox(v-model='isAutoPlay' v-show='isEnablePreviewModel' label='自动播放' size='mini')
        ElButton(v-show='isAutoPlay' @click='isAutoNext ? pause(): play()' size='mini')
          span(v-if='isAutoNext')
            FaIcon(name='sort-alpha-asc')
            | 顺序
          span(v-else)
            FaIcon(name='magic')
            | 自动
    .center.failed(v-if='video && !(video.preview || video.poster)') 不可用
    .center(v-else-if='! (poster || src)')
      Spinner(size='large' :message='loadingMessage' text-fg-color='white')
    img.center(
      draggable
      v-show='poster && (!src || !isEnablePreviewModel)'
      :src='poster'
      @dragstart='ondragstart' 
    )
    video.center(
      draggable
      ref='video'
      v-show='isEnablePreviewModel && src'
      :poster='poster'
      :src='src'
      :autoplay='isAutoPlay'
      :loop='!isAutoNext'
      :controls='!isAutoNext && duration > 0.1'
      @dragstart='ondragstart' 
      @ended='onended'
    )
    .prev(@click='jumpPrevImage')
    .next(@click='jumpNextImage')
    .bottom
      span.caption {{ video ? video.label : ''}}
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

import _ from 'lodash';
import Spinner from 'vue-simple-spinner';
import { Button as ElButton, Checkbox as ElCheckbox } from 'element-ui';

// @ts-ignore
import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/magic';
import 'vue-awesome/icons/sort-alpha-asc';

import TaskInfo from '@/components/TaskInfo.vue';
import FileInfo from '@/components/FileInfo.vue';

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
import { preloadVideo, preloadImage } from '@/preload';
import { isNull } from 'util';
import { mapRootStateModelMixin } from '@/store';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  );
}

export default Vue.extend({
  components: {
    Spinner,
    TaskInfo,
    FileInfo,
    ElButton,
    ElCheckbox,
    FaIcon,
  },
  props: {
    videoId: { type: String, default: null },
  },
  data() {
    return {
      isForce: false,
      isAutoPlay: false,
      isAutoNext: false,
      isFileProtocol,
      posterProgressEvent: null as ProgressEvent | null,
      src: null as string | null,
      poster: null as string | null,
      duration: 0,
    };
  },
  computed: {
    ...videoComputedMinxin,
    ...mapRootStateModelMixin,
    id: {
      get(): string | null {
        return this.videoId;
      },
      set(value: string | null) {
        this.$emit('update:videoId', value);
      },
    },
    posterURL(): string | null {
      return this.isForce
        ? this.getVideoURI(this.videoId, VideoRole.poster, true)
        : this.getBlobURL(this.videoId, VideoRole.poster);
    },
    srcURL(): string | null {
      return this.isForce
        ? this.getVideoURI(this.videoId, VideoRole.preview, true)
        : this.getBlobURL(this.videoId, VideoRole.preview);
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
    loadingMessage(): string {
      if (isNull(this.posterProgressEvent)) {
        return '读取中';
      }
      const total = this.posterProgressEvent.total;
      const loadded = this.posterProgressEvent.loaded;
      return `${((loadded / total) * 100).toFixed(2)}%@${formatBytes(total)}`;
    },
  },
  methods: {
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
      const video = _.find(this.videoStore.storage, i => i.label === hash);
      if (video) {
        this.video = video;
        return;
      }

      // By index.
      const match = /^image(\d+)/.exec(hash);
      if (match) {
        this.id = this.imagePlayList[Number(match[1])];
      }
    },
    setupShortcut() {
      window.addEventListener('keyup', (event: KeyboardEvent) => {
        switch (event.key) {
          case 'ArrowLeft': {
            this.jumpPrevImage();
            break;
          }
          case 'ArrowRight': {
            this.jumpNextImage();
            break;
          }
        }
      });
    },
    onended() {
      if (!this.video) {
        return;
      }
      if (this.isAutoNext) {
        const state = this.findIndex(this.videoPlayList);
        const target = state.array[state.index + 1] || state.array[0];
        const url = this.getVideoURI(target, VideoRole.preview);
        if (!url) {
          return;
        }
        preloadVideo(url).then(() => {
          this.id = target;
        });
      }
    },
    findIndex(videoArray: string[], defaultIndex = 0) {
      const array = _.intersection(videoArray, this.videoStore.visibleVideos);
      const index: number = this.videoId
        ? videoArray.indexOf(this.videoId)
        : defaultIndex;
      return {
        index,
        array,
      };
    },
    jumpNextImage() {
      const state = this.findIndex(this.imagePlayList);
      const target = state.array[state.index + 1] || state.array[0];
      this.id = target;
    },
    jumpPrevImage() {
      const state = this.findIndex(this.imagePlayList);
      const target =
        state.array[state.index - 1] || state.array[state.array.length - 1];
      this.id = target;
    },
    prev(array: string[]): string | null {
      const state = this.findIndex(this.imagePlayList);
      return state.array[state.index - 1] || null;
    },
    next(array: string[]): string | null {
      const state = this.findIndex(this.imagePlayList);
      return state.array[state.index + 1] || null;
    },
    loadPoster() {
      if (!this.posterURL) {
        return;
      }
      const id = this.videoId;
      return preloadImage(this.posterURL).then(image => {
        if (this.videoId !== id) {
          return;
        }
        this.poster = image.src;
      });
    },
    loadSrc() {
      if (!this.srcURL) {
        return;
      }
      const id = this.videoId;
      preloadVideo(this.srcURL).then(video => {
        if (this.videoId !== id) {
          return;
        }
        this.src = video.src;
        this.duration = video.duration;
      });
    },
    preload(id: string) {
      const payload: VideoPreloadActionPayload = {
        id,
        role: VideoRole.poster,
        onprogress: this.onLoadProgress,
      };
      this.$store.dispatch(PRELOAD_VIDEO, payload);
      payload.role = VideoRole.preview;
      this.$store.dispatch(PRELOAD_VIDEO, payload);
    },
    play() {
      this.isAutoNext = true;
      this.isAutoPlay = true;
      if (this.videoElement) {
        this.videoElement.play();
      }
    },
    pause() {
      this.isAutoNext = false;
      if (this.videoElement) {
        this.videoElement.pause();
      }
    },
    onLoadProgress(event: ProgressEvent, config: VideoPreloadActionPayload) {
      if (config.id !== this.videoId) {
        return;
      }
      if (config.role === VideoRole.poster) {
        this.posterProgressEvent = event;
      }
    },
    reset() {
      this.duration = 0;
      this.src = null;
      this.poster = null;
      this.posterProgressEvent = null;
      this.isForce = false;
    },
  },
  watch: {
    videoId(value: string | null) {
      this.reset();
      if (value) {
        this.scrollTo(value);
        window.location.replace(this.url);
        const blobWhitelist = _.uniq(
          _.compact([
            this.id,
            this.prev(this.imagePlayList),
            this.next(this.imagePlayList),
            this.next(this.videoPlayList),
          ]),
        );
        blobWhitelist.map(this.preload);

        const payload: VideoUpdateBlobWhiteListMapMutationPayload = {
          key: 'viewer',
          value: blobWhitelist,
        };
        this.$store.commit(UPDATE_VIDEO_BLOB_WHITELIST, payload);
      } else {
        this.isAutoNext = false;
      }
    },
    srcURL(value) {
      if (value) {
        this.loadSrc();
      } else if (this.videoElement) {
        this.videoElement.removeAttribute('src');
      }
    },
    posterURL(value) {
      if (value) {
        this.loadPoster();
      } else if (this.videoElement) {
        this.videoElement.removeAttribute('poster');
      }
    },
  },
  mounted() {
    this.setupShortcut();
    this.parseHash();
    this.loadSrc();
    this.loadPoster();
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
    text-align: right;
    .video-control {
      display: flex;
      flex-direction: column;
    }
    .fa-icon {
      height: 1em;
    }
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