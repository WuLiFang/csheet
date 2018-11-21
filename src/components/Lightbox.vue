<template lang="pug">
  .lightbox(
    draggable
    :class='{shrink: (!video.thumb_mtime || forceShrink)}'
    @click='onclick'
    @dragstart='ondragstart'
    @mouseenter="onmouseenter" 
    @mouseleave="onmouseleave" 
  )
    .select-overlay(
      v-if='!isFileProtocol'
      v-show='isEditingTags && isSelected'
    )
      FaIcon(name='check-circle-o' scale='3')
    video(
      ref='video'
      :poster='poster' 
      :src='src' 
      :width='200 / ratio'
      :autoplay='isHover'
      muted 
      loop 
    )
    .top-display(:style='upDisplayStyle')
      .artist(v-if='task') {{task.artist}}
      LightboxTaskStatus.status(
        v-if='taskId' 
        :id='taskId' 
        :statusStage='statusStage'
      )
    .bottom-display(:style='captionStyle')
      span {{ video.label }}
</template>

<script lang='ts'>
import { isFileProtocol } from '@/packtools';
import { preloadImage, preloadVideo } from '@/preload';
import { RootComputedMixin } from '@/store';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { tagComputedMinxin } from '@/store/tag';
import {
  Button as ElButton,
  Input as ElInput,
  Popover as ElPopover,
  Tag as ElTag,
} from 'element-ui';
import Vue from 'vue';
// @ts-ignore
import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/check-circle-o';
import {
  CGTeamWorkTaskResponse,
  TagResponse,
  VideoResponse,
  VideoRole,
} from '../interface';
import {
  PRELOAD_VIDEO,
  UPDATE_VIDEO_SELECT_STATE,
  VideoPreloadActionPayload,
  VideoTagsDeleteActionPayload,
  VideoUpdateSelectStateMutationPayload,
  VIDEO_TAGS,
} from '../mutation-types';
import { videoComputedMinxin } from '../store/video';
import LightboxTaskStatus from '@/components/LightboxTaskStatus.vue';
import { isNull } from 'util';

export default Vue.extend({
  components: {
    LightboxTaskStatus,
    FaIcon,
    ElPopover,
    ElInput,
  },
  props: {
    id: { type: String },
  },
  data() {
    return {
      isHover: false,
      tagSelectModel: [],
      isTagEditDialogVisible: false,
      forceShrink: false,
      src: null as string | null,
      poster: null as string | null,
      ratio: 0.5625,
      isFileProtocol,
    };
  },
  computed: {
    ...videoComputedMinxin,
    ...CGTeamWorkTaskComputedMixin,
    ...RootComputedMixin,
    isSelected: {
      get(): boolean {
        return this.videoStore.selectStateMap[this.id] || false;
      },
      set(value: boolean) {
        const payload: VideoUpdateSelectStateMutationPayload = {
          [this.id]: value,
        };
        this.$store.commit(UPDATE_VIDEO_SELECT_STATE, payload);
      },
    },
    video(): VideoResponse | undefined {
      return this.videoStore.storage[this.id];
    },
    posterURL(): string | null {
      return this.getVideoURI(this.id, VideoRole.thumb);
    },
    srcURL(): string | null {
      if (this.isEnablePreview) {
        return this.getBlobURL(this.id, VideoRole.preview);
      }
      return null;
    },
    captionStyle(): object {
      if (this.isFixedTitleDisplay) {
        return {
          transform: 'none',
        };
      }
      return {};
    },
    upDisplayStyle(): object {
      if (this.isFixedStatusDisplay) {
        return {
          transform: 'none',
        };
      }
      return {};
    },
    videoElement(): HTMLVideoElement {
      return this.$refs.video as HTMLVideoElement;
    },
    taskId(): string | null {
      return this.task ? this.task.id : null;
    },
    task(): CGTeamWorkTaskResponse | undefined {
      return this.video && this.cgTeamworkTaskStore.storage[this.video.uuid];
    },
    isEnablePreview(): boolean {
      return this.$store.state.isEnablePreview;
    },
  },
  methods: {
    onclick() {
      if (this.isEditingTags) {
        this.isSelected = !this.isSelected;
      } else {
        this.$emit('click', this.video);
      }
    },
    ondragstart(event: DragEvent) {
      if (!this.video) {
        return;
      }
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
              window.location.pathname.lastIndexOf('/')
            )
          ) +
          '/' +
          plainData;
      }
      event.dataTransfer!.setData('text/plain', plainData);
    },
    play() {
      if (this.videoElement.readyState > 1) {
        this.videoElement.play();
      }
    },
    onmouseenter() {
      this.isHover = true;
      this.loadSrc();
      const payload: VideoPreloadActionPayload = {
        id: this.id,
        role: VideoRole.preview,
      };
      this.$store.dispatch(PRELOAD_VIDEO, payload);
      payload.role = VideoRole.poster;
      this.$store.dispatch(PRELOAD_VIDEO, payload);
      this.play();
    },
    onmouseleave() {
      this.isHover = false;
      this.videoElement.pause();
    },
    loadPoster() {
      const value = this.posterURL;
      if (!value) {
        return;
      }
      preloadImage(value).then(image => {
        if (this.posterURL === value) {
          this.ratio = image.naturalHeight / image.naturalWidth;
          this.poster = image.src;
        }
      });
    },
    loadSrc() {
      const value = this.srcURL;
      if (!value) {
        return;
      }
      preloadVideo(value).then(video => {
        if (this.srcURL === value) {
          this.ratio = video.videoHeight / video.videoWidth;
          this.src = video.src;
        }
      });
    },
  },
  watch: {
    posterURL(value) {
      this.loadPoster();
    },
    srcURL(value) {
      if (value) {
        if (this.isHover) {
          this.loadSrc();
        }
      } else {
        this.src = null;
        this.videoElement.load();
      }
    },
  },
  mounted() {
    this.poster = this.posterURL;
    this.loadPoster();
    this.$nextTick(() => {
      this.videoElementHub.set(this.id, this.$el);
    });
  },
});
</script>

<style lang='scss' scoped>
.lightbox {
  color: white;
  position: relative;
  height: 200px;
  margin: 5px;
  overflow: hidden;
  cursor: zoom-in;
  transition: 0.5s ease-in-out;
  video {
    max-width: 100%;
    max-height: 100%;
  }
  .el-tag {
    margin: 1em;
  }
  .select-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba($color: green, $alpha: 0.2);
  }
  .top-display {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    background: rgba($color: black, $alpha: 0.5);
    .artist {
      flex: 1 1 auto;
      margin: 0 0.2em;
    }
    .status {
      flex: 0.2 1 auto;
      text-align: center;
    }
    transition: 0.3s ease-in-out;
    transform: translateY(-100%);
  }
  .bottom-display {
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
  &:hover {
    .bottom-display,
    .top-display {
      transform: none;
    }
  }
  &.shrink {
    background: rgba(255, 255, 255, 0.2);
    width: 10px;
    .bottom-display,
    .top-display {
      display: none;
    }
  }
}
</style>
