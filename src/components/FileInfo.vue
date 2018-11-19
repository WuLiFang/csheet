<template lang="pug">
    .file-info(v-if='videoData')
      .time(v-show='videoData.poster_mtime')
        span.text
          | 图像
          |
        FaIcon.icon(name='file-image-o')
        |
        | :
        RelativeTime(:timestamp='videoData.poster_mtime')
      br
      .time(v-show='videoData.src_mtime || videoData.preview_mtime')
        span.text
          | 视频
          |
        FaIcon.icon(name='file-video-o')
        |
        | :
        RelativeTime(:timestamp='videoData.src_mtime || videoData.preview_mtime')
        span.message(v-show='videoData.preview_mtime != videoData.src_mtime')
          span.outdated(v-if='videoData.preview_mtime')
            | 预览非最新:
            RelativeTime(:timestamp='videoData.preview_mtime')
          span.outdated(v-if='!videoData.src_mtime && videoData.preview_mtime')
            | 源文件已删除
          span.broken(v-else-if='videoData.src_broken_mtime')
            span.outdated 转码失败
            ElButton(@click='retryTranscode' size='mini') 重试
          span.notready(v-else)
            | 预览未就绪: 等待转码


</template>


<script lang="ts">
import Vue from 'vue';

import { Button as ElButton } from 'element-ui';
import * as moment from 'moment';
// @ts-ignore
import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/file-video-o';
import 'vue-awesome/icons/file-image-o';

import RelativeTime from '@/components/RelativeTime.vue';

import { VideoResponse } from '../interface';
import { videoComputedMinxin } from '../store/video';
import { VIDEO, VideoUpdateActionPayload } from '@/mutation-types';

export default Vue.extend({
  props: { id: { type: String } },
  components: {
    RelativeTime,
    FaIcon,
    ElButton,
  },
  computed: {
    ...videoComputedMinxin,
    videoData(): VideoResponse {
      return this.videoStore.storage[this.id];
    },
  },
  methods: {
    retryTranscode() {
      const payload: VideoUpdateActionPayload = {
        id: this.id,
        data: {
          key: 'src_broken_mtime',
          value: null,
        },
      };
      this.$store.dispatch(VIDEO.UPDATE, payload);
    },
  },
});
</script>
<style lang="scss" scoped>
.file-info {
  display: inline-block;
  margin: 5px;
  .icon {
    vertical-align: -0.15em;
  }
  .time {
    display: inline-block;
    .outdated {
      background: crimson;
    }
    .notready {
      background: darkorange;
    }
  }
  color: white;
  opacity: 0.5;
  text-align: left;
  transition: 0.2s ease-in-out;
  .text {
    visibility: hidden;
    position: absolute;
  }
  &:hover {
    background: black;
    opacity: 1;
    .text {
      position: relative;
      visibility: visible;
    }
  }
}
</style>
