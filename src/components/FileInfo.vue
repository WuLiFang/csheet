<template lang="pug">
    .file-info(v-if='videoData')
      span
        | 单帧:
        RelativeTime(:timestamp='videoData.poster_mtime')
      span 
        | 视频:
        RelativeTime(:timestamp='videoData.src_mtime')
</template>


<script lang="ts">
import Vue from "vue";

import * as moment from "moment";

import RelativeTime from "./RelativeTime.vue";

import { videoHub, requestVideoData } from "../hub";
import { VideoResponse } from "../interface";

export default Vue.extend({
  props: { id: { type: String } },
  data() {
    return {
      hub: videoHub
    };
  },
  components: {
    RelativeTime
  },
  computed: {
    videoData(): VideoResponse {
      return this.hub[this.id];
    }
  },
  mounted() {
    requestVideoData(this.id);
  },
  watch: {
    id(value) {
      requestVideoData(value);
    }
  }
});
</script>
<style lang="scss" scoped>
.file-info {
  color: white;
  opacity: 0.5;
  transition: 0.2s ease-in-out;
  &:hover {
    background: black;
    opacity: 1;
  }
}
</style>
