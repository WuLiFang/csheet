<template lang="pug">
transition(name='dropdown')
  .the-csheet-viewer(v-show='isVisible')
    .overlay(@click='isVisible = false')
    .detail(v-if='video')
      TaskInfo(:id="video.uuid")
      FileInfo(:id="video.uuid")
      Tags(:id='video.uuid')
    .topright
      ElButton(
        @click='refresh' 
        v-if='!isFileProtocol' 
        size='small' 
        icon='el-icon-refresh'
      ) 刷新
      .video-control(v-show='src')
        ElCheckbox(
          v-model='isEnablePreview'
          @click='value => value ? play() : puase()'
          label='视频'
          size='mini')
        ElCheckbox(
          v-model='isAutoPlay' 
          v-show='isEnablePreview'
          @change='isAutoPlay ? play(): pause()'
          label='自动播放'
          size='mini')
        ElButton(
          v-show='isEnablePreview && isAutoPlay'
          @click='isAutoNext = !isAutoNext'
          size='mini')
          span(v-if='isAutoNext')
            FaIcon(name='sort-alpha-asc')
            | 顺序
          span(v-else)
            FaIcon(name='magic')
            | 自动
    FadeTransition
      video.center(
        v-if='isEnablePreview && src'
        :poster='poster'
        :src='src'
        :autoplay='isAutoPlay'
        :loop='!isAutoNext'
        :controls='duration > 0.1'
        @dragstart='ondragstart' 
        @ended='autoNext'
        @stalled='autoNext'
        ref='video'
        draggable
      )
      img.center(
        v-else-if='poster'
        :src='poster'
        @dragstart='ondragstart' 
        draggable
      )
      .center(v-else-if='video && (video.poster || video.preview)')
        Spinner(
          :message='loadingMessage'
          size='large'
          text-fg-color='white')
      .center.failed(v-else) 不可用
    .prev(@click='jumpPrev')
    .next(@click='jumpNext')
    .bottom
      span.caption {{ video ? video.label : ''}}
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

import _ from 'lodash';
import Spinner from 'vue-simple-spinner';
import { Button as ElButton, Checkbox as ElCheckbox } from 'element-ui';

import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/magic';
import 'vue-awesome/icons/sort-alpha-asc';

import TaskInfo from '@/components/TaskInfo.vue';
import FileInfo from '@/components/FileInfo.vue';
import Tags from '@/components/Tags.vue';

import { isFileProtocol } from '@/packtools';
import { LoadStatus, DollarStore } from '@/store/types';
import { VideoResponse, VideoRole } from '@/interface';
import {
  VideoReadActionPayload,
  VIDEO,
  PRELOAD_VIDEO,
  VideoPreloadActionPayload,
  VideoUpdateBlobWhiteListMapMutationPayload,
  UPDATE_VIDEO_BLOB_WHITELIST,
  StateUpdateMutationPayload,
  UPDATE_ROOT_STATE,
} from '../mutation-types';
import { preloadVideo, preloadImage } from '@/preload';
import { Prop, Component, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import FadeTransition from '@/components/FadeTransition.vue';

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

@Component({
  components: {
    Spinner,
    TaskInfo,
    FileInfo,
    ElButton,
    ElCheckbox,
    FaIcon,
    Tags,
    FadeTransition,
  },
})
export default class TheViewer extends Vue {
  @Prop({ type: String, default: null })
  videoId!: string | null;
  @Prop(Boolean)
  visible!: boolean;

  isForce = false;
  isAutoPlay = true;
  isAutoNext = false;
  isFileProtocol = isFileProtocol;
  posterProgressEvent: ProgressEvent | null = null;
  src: string | null = null;
  poster: string | null = null;
  duration = 0;

  $store!: DollarStore;
  $refs!: Vue['$refs'] & {
    video?: HTMLVideoElement;
  };

  get id(): string | null {
    return this.videoId;
  }
  set id(value: string | null) {
    this.$emit('update:videoId', value);
  }
  get isVisible(): boolean {
    return this.visible;
  }
  set isVisible(value: boolean) {
    this.$emit('update:visible', value);
  }
  get isEnablePreview(): boolean {
    return this.$store.state.isEnablePreview;
  }
  set isEnablePreview(value: boolean) {
    const payload: StateUpdateMutationPayload<DollarStore['state']> = {
      key: 'isEnablePreview',
      value,
    };
    this.$store.commit(UPDATE_ROOT_STATE, payload);
  }
  get posterURL(): string | null {
    if (!this.videoId) {
      return null;
    }
    return this.isForce
      ? this.$store.getters.getVideoURI(this.videoId, VideoRole.poster, true)
      : this.$store.getters.getBlobURL(this.videoId, VideoRole.poster);
  }
  get srcURL(): string | null {
    if (!this.videoId) {
      return null;
    }
    return this.isForce
      ? this.$store.getters.getVideoURI(this.videoId, VideoRole.preview, true)
      : this.$store.getters.getBlobURL(this.videoId, VideoRole.preview);
  }
  get video(): VideoResponse | null {
    if (!this.videoId) {
      return null;
    }
    return this.$store.state.videoStore.storage[this.videoId] || null;
  }
  set video(value: VideoResponse | null) {
    this.id = value ? value.uuid : null;
  }
  get url(): string {
    const hash = this.video ? `#${this.video.label}` : '';
    return `${window.location.href.split('#')[0]}${hash}`;
  }
  get loadingMessage(): string {
    if (!this.posterProgressEvent) {
      return '读取中';
    }
    const total = this.posterProgressEvent.total;
    const loadded = this.posterProgressEvent.loaded;
    return `${((loadded / total) * 100).toFixed(2)}%@${formatBytes(total)}`;
  }

  refresh() {
    if (!this.videoId) {
      return;
    }
    const payload: VideoReadActionPayload = { id: this.videoId };
    this.isForce = true;
    this.$store.dispatch(VIDEO.READ, payload);
  }
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
            window.location.pathname.lastIndexOf('/')
          )
        ) +
        '/' +
        plainData;
    }
    event.dataTransfer!.setData('text/plain', plainData);
  }
  parseHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      return;
    }

    // By label
    const video = _.find(
      this.$store.state.videoStore.storage,
      i => i!.label === hash
    );
    if (video) {
      this.video = video;
      this.isVisible = true;
      return;
    }

    // By index.
    const match = /^image(\d+)/.exec(hash);
    if (match) {
      this.id = this.$store.getters.imagePlayList[Number(match[1])];
    }
  }
  setupShortcut() {
    window.addEventListener('keyup', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft': {
          this.jumpPrev();
          break;
        }
        case 'ArrowRight': {
          this.jumpNext();
          break;
        }
      }
    });
  }
  autoNext() {
    if (!this.video || !this.isEnablePreview) {
      return;
    }
    if (this.isAutoNext) {
      const state = this.findIndex(this.$store.getters.videoPlayList);
      const target = state.array[state.index + 1] || state.array[0];
      const url = this.$store.getters.getVideoURI(target, VideoRole.preview);
      if (!url) {
        return;
      }
      preloadVideo(url).then(() => {
        this.id = target;
      });
    }
  }
  findIndex(videoArray: string[], defaultIndex = 0) {
    const array = _.intersection(
      videoArray,
      this.$store.state.videoStore.visibleVideos
    );
    const index: number = this.videoId
      ? videoArray.indexOf(this.videoId)
      : defaultIndex;
    return {
      index,
      array,
    };
  }
  jumpPrev() {
    const array = this.$store.state.videoStore.visibleVideos;
    const target = this.prev(array) || array[array.length - 1];
    this.id = target;
  }
  jumpNext() {
    const array = this.$store.state.videoStore.visibleVideos;
    const target = this.next(array) || array[0];
    this.id = target;
  }
  prev(array: string[]): string | null {
    const state = this.findIndex(array);
    return state.array[state.index - 1] || null;
  }
  next(array: string[]): string | null {
    const state = this.findIndex(array);
    return state.array[state.index + 1] || null;
  }
  loadPoster(url: string) {
    const id = this.videoId;
    return preloadImage(url).then(image => {
      if (this.videoId !== id) {
        return;
      }
      this.poster = image.src;
    });
  }
  loadSrc(url: string) {
    const id = this.videoId;
    preloadVideo(url).then(video => {
      if (this.videoId !== id) {
        return;
      }
      this.src = video.src;
      this.duration = video.duration;
    });
  }
  preload(id: string) {
    const payload: VideoPreloadActionPayload = {
      id,
      role: VideoRole.poster,
      onprogress: this.onLoadProgress,
    };
    this.$store.dispatch(PRELOAD_VIDEO, payload);
    payload.role = VideoRole.preview;
    this.$store.dispatch(PRELOAD_VIDEO, payload);
  }
  play() {
    if (this.$refs.video) {
      this.$refs.video.play();
    }
  }
  pause() {
    if (this.$refs.video) {
      this.$refs.video.pause();
    }
  }
  onLoadProgress(event: ProgressEvent, config: VideoPreloadActionPayload) {
    if (config.id !== this.videoId) {
      return;
    }
    if (config.role === VideoRole.poster) {
      this.posterProgressEvent = event;
    }
  }
  loadData() {
    if (this.id) {
      this.$store.getters.scrollTo(this.id);
    }
    const blobWhitelist = _.uniq(
      _.compact([
        this.id,
        this.prev(this.$store.getters.imagePlayList),
        this.next(this.$store.getters.imagePlayList),
        this.next(this.$store.getters.videoPlayList),
      ])
    );
    blobWhitelist.map(this.preload);

    const payload: VideoUpdateBlobWhiteListMapMutationPayload = {
      key: 'viewer',
      value: blobWhitelist,
    };
    this.$store.commit(UPDATE_VIDEO_BLOB_WHITELIST, payload);
  }
  @Watch('visible')
  onVisibleChange(value: TheViewer['visible']) {
    this.loadData();
    if (this.visible) {
      if (this.isAutoPlay) {
        this.play();
      }
    } else {
      this.pause();
    }
  }
  @Watch('videoId')
  onVideoIdChange(value: string | null) {
    this.duration = 0;
    this.posterProgressEvent = null;
    this.isForce = false;
    if (value) {
      window.location.replace(this.url);
      this.loadData();
    } else {
      this.isAutoNext = false;
    }
  }
  @Watch('srcURL')
  onSrcURLChange(value: TheViewer['srcURL']) {
    if (value) {
      this.loadSrc(value);
    } else {
      this.src = null;
      if (this.$refs.video) {
        this.$refs.video.removeAttribute('src');
        this.$refs.video.load();
      }
    }
  }
  @Watch('posterURL')
  onPosterURLChange(value: TheViewer['posterURL']) {
    if (value) {
      this.loadPoster(value);
    } else {
      this.poster = null;
      if (this.$refs.video) {
        this.$refs.video.removeAttribute('poster');
      }
    }
  }
  mounted() {
    this.setupShortcut();
    this.parseHash();
    this.loadData();
  }
}
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
    .tags {
      max-width: 10em;
    }
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
.dropdown-enter-active,
.dropdown-leave-active {
  transition: 0.2s ease-in-out;
  .prev,
  .next {
    transition: 0.2s ease-out;
  }
}
.dropdown-enter,
.dropdown-appear,
.dropdown-leave-to {
  top: -100vh;
  opacity: 0;
  .prev {
    left: -2%;
  }
  .next {
    right: -2%;
  }
  .bottom {
    position: fixed;
  }
}
</style>