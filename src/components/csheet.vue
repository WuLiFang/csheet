<template lang="pug">
  div(class='videos')
    div(class='control')
      label 标题
      input(type='checkbox' v-model='isShowTitle')
    lightbox(v-for='video in videos' :video='video' :key='video.label' @click="onclick" :isShowTitle='isShowTitle')
    viewer(:video.sync='current')
</template>

<script lang="ts">
import Vue from "vue";
import { VideoStorage, CSheetVideo } from "../video";
import Lightbox from "./lightbox.vue";
import Viewer from "./viewer.vue";
export default Vue.extend({
  props: {
    videos: { type: <() => VideoStorage>Object }
  },
  data() {
    return {
      current: <CSheetVideo | null>null,
      isShowTitle: false
    };
  },
  methods: {
    onclick(video: CSheetVideo) {
      this.current = video;
    }
  },
  components: {
    Lightbox,
    Viewer
  }
});
</script>

<style lang="scss" scoped>
.videos {
  display: flex;
  position: relative;
  flex-wrap: wrap;
  justify-content: center;
  width: 85vw;
  margin: auto;
  &:hover {
    border-left: 1px dotted rgba(255, 255, 255, 0.3);
    border-right: 1px dotted rgba(255, 255, 255, 0.3);
  }
}
.control {
  position: fixed;
  color: white;
  right: 0;
  top: 0;
  margin: 0.5%;
}
</style>
<style lang="scss">
body {
  margin: 0;
  background: black;
}
</style>
