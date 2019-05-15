<template lang="pug">
  .file-count
    .left
      i.video(v-show='videoCount > 0')
        FaIcon(name='regular/file-video')
        | {{videoCount}}
      i.image(v-show='imageCount > 0')
        FaIcon(name='regular/file-image')
        | {{imageCount}}
    .right
      i.total
        FaIcon(scale='1.2' name='regular/file')
        | {{totalCount}}
</template>
<script lang="ts">
import Vue from 'vue';

import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/regular/file';
import 'vue-awesome/icons/regular/file-image';
import 'vue-awesome/icons/regular/file-video';

import { videoComputedMixin } from '@/store/video';

export default Vue.extend({
  components: {
    FaIcon,
  },
  computed: {
    ...videoComputedMixin,
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
  text-align: center;
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
