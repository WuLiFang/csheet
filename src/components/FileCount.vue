<template lang="pug">
  .file-count
    .left
      i.video(v-show='videoCount > 0')
        FaIcon( name='file-video-o')
        | {{videoCount}}
      i.image(v-show='imageCount > 0')
        FaIcon(name='file-image-o')
        | {{imageCount}}
    .right
      i.total(v-show='totalCount > 0')
        FaIcon(scale='1.2' name='file-o')
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
<style lang="scss" scoped>
.file-count {
  display: flex;
  flex-direction: row;
  .left,
  .right {
    flex: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .right {
    font-size: 1.2em;
  }
}
</style>
