<template lang="pug">
  div.videos
    div.control
      div {{avaliableCount}}/{{totalCount}}
      label 标题
      input(type='checkbox' v-model='isShowTitle')
      div
        input.filter(placeholder='正则过滤' v-model='filterText')
      a.pack(v-if='isShowPack' :href="packURL" :download="packFilename" @click='isShowPack = false')
        div
          button 打包
    lightbox(v-for='video in videos' :video='video' v-show='filter(video)' :key='video.label' @click="onclick" :isShowTitle='isShowTitle')
    viewer(:video.sync='current')
</template>

<script lang="ts">
import Vue from "vue";
import { VideoStorage, CSheetVideo } from "../video";
import * as _ from "lodash";
import Lightbox from "./lightbox.vue";
import Viewer from "./viewer.vue";
import { isFileProtocol } from "../packtools";
export default Vue.extend({
  props: {
    videos: { type: <() => VideoStorage>Object }
  },
  data() {
    return {
      current: <CSheetVideo | null>null,
      isShowTitle: false,
      isShowPack: isFileProtocol ? false : true,
      filterText: ""
    };
  },
  computed: {
    avaliableCount(): number {
      return _.filter(this.videos, value => value.poster_mtime !== null).length;
    },
    totalCount(): number {
      return _.keys(this.videos).length;
    },
    packURL(): string {
      return `${window.location.origin}${window.location.pathname}${window
        .location.search || "?"}&pack=1`;
    },
    packFilename(): string {
      return `${document.title}.zip`;
    }
  },
  methods: {
    onclick(video: CSheetVideo) {
      this.current = video;
    },
    filter(video: CSheetVideo): boolean {
      if (!this.filterText) {
        return true;
      }
      return new RegExp(this.filterText, "i").test(video.label);
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
  text-align: right;
  .filter {
    width: 5em;
    text-align: right;
  }
  .pack {
    margin: 1em;
  }
}
</style>
<style lang="scss">
body {
  margin: 0;
  background: black;
}
</style>
