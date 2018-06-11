<template lang="pug">
  .file-count
    i.video(v-show='videoCount > 0')
      FaIcon(name='file-video-o')
      | {{videoCount}}
    i.image(v-show='imageCount > 0')
      FaIcon(name='file-image-o')
      | {{imageCount}}
    i.total(v-show='totalCount > 5')
      FaIcon(name='file-o')
      | {{totalCount}}
</template>
<script lang="ts">
import Vue from 'vue';

// @ts-ignore
import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/file-o';
import 'vue-awesome/icons/file-video-o';
import 'vue-awesome/icons/file-image-o';

import { videoComputedMinxin } from '@/store/video';

export default Vue.extend({
  components: {
    FaIcon,
  },
  computed: {
    ...videoComputedMinxin,
    videoCount(): number {
      return this.videoPlayList.length;
    },
    imageCount(): number {
      return this.imagePlayList.length;
    },
    totalCount(): number {
      return this.videoStore.visibleVideos.length;
    },
  },
});
</script>
