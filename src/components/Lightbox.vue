<template lang="pug">
  .lightbox(
    v-show='isVisible'
    draggable
    :class='{shrink: (!video.thumb_mtime || forceShrink)}'
    :hidden='!isVisible'
    @click='onclick'
    @dragstart='ondragstart'
    @mouseenter="onmouseenter" 
    @mouseleave="onmouseleave" 
  )
    ElPopover(trigger="hover", :disabled='tags.length === 0')
      ElTag(v-for='i in tags' @close='deleteVideoTag(i)' closable) {{ i.text }}
      .reference(slot='reference')
        .select-overlay(v-show='isSelectable && selected')
          FaIcon(name='check-circle-o' scale='3')
        video(
          ref='video'
          :poster='poster' 
          :src='src' 
          :width='200 / ratio'
          @loadeddata="onloadeddata"
          muted 
          loop 
        )
        div.up-display(:style='upDisplayStyle')
          .artist(v-if='task') {{task.artist}}
          LightboxTaskStatus.status(
            v-if='taskId' 
            :id='taskId' 
            :statusStage='statusStage'
          )
        div
          span.caption(:style='captionStyle') {{ video.label }}
</template>


<script lang="ts">
import Vue from 'vue';

// @ts-ignore
import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/check-circle-o';

import { Popover as ElPopover, Tag as ElTag } from 'element-ui';
import { videoComputedMinxin } from '../store/video';
import {
  VideoResponse,
  VideoRole,
  CGTeamWorkTaskData,
  TaskStage,
  TaskStatus,
  TagResponse,
} from '../interface';
import {
  VideoSetVisibilityMutationPayload,
  SET_VIDEO_VISIBILITY,
  VideoUpdateAppearingMutationPayload,
  VideoUpdatePositionMutationPayload,
  UPDATE_VIDEO_POSITION,
  VideoPreloadActionPayload,
  PRELOAD_VIDEO,
  VideoTagsDeleteActionPayload,
  VIDEO_TAGS,
} from '../mutation-types';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { isFileProtocol } from '@/packtools';

import LightboxTaskStatus from './LightboxTaskStatus.vue';
import { preloadVideo, preloadImage } from '@/preload';
import { tagComputedMinxin } from '@/store/tag';

export default Vue.extend({
  components: {
    LightboxTaskStatus,
    FaIcon,
    ElPopover,
    ElTag,
  },
  props: {
    value: { type: Boolean },
    id: { type: String },
    isSelectable: { default: false },
    isShowTitle: { default: false },
    isShowStatus: { default: false },
    isVisible: { default: false },
    statusStage: {
      type: Number as () => TaskStage,
      default: TaskStage.director,
    },
  },
  data() {
    return {
      isLoadVideo: false,
      isAutoplay: false,
      forceShrink: false,
      src: null as string | null,
      poster: null as string | null,
      ratio: 0.5625,
    };
  },
  computed: {
    ...videoComputedMinxin,
    ...CGTeamWorkTaskComputedMixin,
    ...tagComputedMinxin,
    selected: {
      get(): boolean {
        return this.value;
      },
      set(value: boolean) {
        this.$emit('input', value);
      },
    },
    top(): number {
      return this.$el.offsetTop;
    },
    video(): VideoResponse {
      return this.videoStore.storage[this.id];
    },
    posterURL(): string | null {
      return this.getVideoURI(this.id, VideoRole.thumb);
    },
    srcURL(): string | null {
      if (this.isLoadVideo) {
        return this.getBlobURL(this.id, VideoRole.preview);
      }
      return null;
    },
    captionStyle(): object {
      if (this.isShowTitle) {
        return {
          transform: 'none',
        };
      }
      return {};
    },
    upDisplayStyle(): object {
      if (this.isShowStatus) {
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
    task(): CGTeamWorkTaskData | undefined {
      return this.cgTeamworkTaskStore.storage[this.video.uuid];
    },
    tags(): TagResponse[] {
      return this.video.tags.map(i => this.tagStore.storage[i]);
    },
  },
  methods: {
    onclick() {
      if (this.isSelectable) {
        this.selected = !this.selected;
      } else {
        this.$emit('click', this.video);
      }
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
              window.location.pathname.lastIndexOf('/'),
            ),
          ) +
          '/' +
          plainData;
      }
      event.dataTransfer.setData('text/plain', plainData);
    },
    play() {
      if (this.videoElement.readyState > 1) {
        this.videoElement.play();
      }
    },
    onmouseenter() {
      this.isLoadVideo = true;
      this.isAutoplay = true;
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
      this.isAutoplay = false;
      this.videoElement.pause();
    },
    onloadeddata() {
      if (this.isAutoplay) {
        this.play();
      }
    },
    updateRatio() {
      if (!this.posterURL) {
        return;
      }
      preloadImage(this.posterURL).then(image => {
        this.ratio = image.naturalHeight / image.naturalWidth;
      });
    },
    deleteVideoTag(tag: TagResponse) {
      const payload: VideoTagsDeleteActionPayload = {
        id: this.video.uuid,
        data: {
          tags: [tag.id],
        },
      };
      this.$store.dispatch(VIDEO_TAGS.DELETE, payload);
    },
  },
  watch: {
    posterURL(value) {
      this.updateRatio();
    },
    srcURL(value) {
      if (value) {
        preloadVideo(value).then(video => {
          this.ratio = video.videoHeight / video.videoWidth;
          this.src = video.src;
        });
        this.isLoadVideo = false;
      }
    },
  },
  mounted() {
    this.poster = this.posterURL;
    this.updateRatio();
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
  .up-display {
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
  &:hover {
    .caption,
    .up-display {
      transform: none;
    }
  }
  &.shrink {
    background: rgba(255, 255, 255, 0.2);
    width: 10px;
    .caption,
    .up-display {
      display: none;
    }
  }
}
</style>
