<template lang="pug">
    .file-info(v-if='videoData')
      .time(v-show='videoData.poster_mtime')
        | 图像:
        RelativeTime(:timestamp='videoData.poster_mtime')
      br
      .time(v-show='videoData.src_mtime')
        | 视频:
        RelativeTime(:timestamp='videoData.src_mtime')
        span.warn(v-show='videoData.preview_mtime != videoData.src_mtime')
          | 当前预览非最新:
          RelativeTime(:timestamp='videoData.preview_mtime')
</template>


<script lang="ts">
import Vue from 'vue';

import * as moment from 'moment';

import RelativeTime from './RelativeTime.vue';

import { VideoResponse } from '../interface';
import { videoComputedMinxin } from '../store/video';

export default Vue.extend({
  props: { id: { type: String } },
  components: {
    RelativeTime,
  },
  computed: {
    ...videoComputedMinxin,
    videoData(): VideoResponse {
      return this.videoStore.storage[this.id];
    },
  },
});
</script>
<style lang="scss" scoped>
.file-info {
  display: inline-block;
  margin: 5px;
  .time {
    display: inline-block;
    .warn {
      background: crimson;
    }
  }
  color: white;
  opacity: 0.5;
  text-align: left;
  transition: 0.2s ease-in-out;
  &:hover {
    background: black;
    opacity: 1;
  }
}
</style>
