<template lang="pug">
  div.videos
    div.control
      div {{avaliableCount}}/{{totalCount}}
      div
        label 标题
        input(type='checkbox' v-model='isShowTitle')
      div(v-if='hasTaskStorage')
        label 任务信息
        input(type='checkbox' v-model='isShowStatus')
      div 
        input.filter(
          placeholder='正则过滤' 
          v-model='filterText' 
        )
        button(
          v-show='filterText'
          @click='filterText = ""'
        ) 重置
      div.pack(v-if='isShowPack')
        a(:href="packURL" :download="packFilename" @click='isShowPack = false')
          button 打包
    Lightbox(
      v-for='video in videos'
      :id='video.uuid' 
      :key='video.label' 
      :isVisible='filter(video)'
      :isShowTitle='isShowTitle' 
      :isShowStatus='isShowStatus'
      @click="onclick" 
    )
    TheCSheetViewer(:videoId.sync='current')
</template>

<script lang="ts">
import Vue from 'vue';

import * as _ from 'lodash';

import Lightbox from './Lightbox.vue';
import TheCSheetViewer from './TheCSheetViewer.vue';
import { isFileProtocol } from '../packtools';
import { videoComputedMinxin } from '../store/video';
import { VideoResponse } from '../interface';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';

export default Vue.extend({
  data() {
    return {
      current: null as string | null,
      isShowTitle: false,
      isShowStatus: false,
      isShowPack: isFileProtocol ? false : true,
      filterText: '',
      avaliableCount: -1,
      totalCount: -1,
    };
  },
  computed: {
    ...videoComputedMinxin,
    ...CGTeamWorkTaskComputedMixin,
    hasTaskStorage(): boolean {
      return !_.isEmpty(this.cgTeamworkTaskStore.storage);
    },
    videos(): VideoResponse[] {
      return _.values(this.videoStore.storage);
    },
    packURL(): string {
      return `${window.location.origin}${window.location.pathname}${window
        .location.search || '?'}&pack=1`;
    },
    packFilename(): string {
      return `${document.title}.zip`;
    },
  },
  methods: {
    onclick(video: VideoResponse) {
      this.current = video.uuid;
    },
    filter(video: VideoResponse): boolean {
      if (!this.filterText) {
        return true;
      }
      return new RegExp(this.filterText, 'i').test(video.label);
    },
    count() {
      this.avaliableCount = this.videos.filter(i => {
        const element = this.videoElementHub.get(i.uuid);
        if (!element || element.hidden) {
          return false;
        }
        return Boolean(i.poster_mtime);
      }).length;
      this.totalCount = this.videos.length;
    },
  },
  components: {
    Lightbox,
    TheCSheetViewer,
  },
  updated() {
    this.count();
  },
  mounted() {
    this.count();
  },
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
    margin-top: 1em;
    margin-bottom: 1em;
  }
}
</style>
<style lang="scss">
body {
  margin: 0;
  background: black;
}
</style>
