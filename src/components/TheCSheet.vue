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
      div(v-show='isShowStatus')
        label 模式
        select(v-model='statusMode')
          option 组长
          option 导演
          option 客户
        StatusSelect(:select.sync='statusSelect')
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
      :statusStage='statusStage'
      @click="onclick" 
    )
    TheCSheetViewer(:videoId.sync='current')
</template>

<script lang="ts">
import Vue from 'vue';

import * as _ from 'lodash';

import Lightbox from './Lightbox.vue';
import StatusSelect from './StatusSelect.vue';
import { StatusSelectResult } from './StatusSelect.vue';
import TheCSheetViewer from './TheCSheetViewer.vue';

import { isFileProtocol } from '../packtools';
import { videoComputedMinxin } from '../store/video';
import { VideoResponse, TaskStage, TaskStatus } from '../interface';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';

export default Vue.extend({
  data() {
    return {
      current: null as string | null,
      isShowTitle: false,
      isShowStatus: false,
      isShowPack: isFileProtocol ? false : true,
      statusMode: '导演',
      filterText: '',
      avaliableCount: -1,
      totalCount: -1,
      statusSelect: <StatusSelectResult>{
        [TaskStatus.Close]: false,
        [TaskStatus.Retake]: true,
        [TaskStatus.Wait]: true,
        [TaskStatus.Check]: true,
        [TaskStatus.Approve]: true,
        other: true,
      },
    };
  },
  computed: {
    ...videoComputedMinxin,
    ...CGTeamWorkTaskComputedMixin,
    statusStage(): TaskStage {
      let ret: TaskStage;
      switch (this.statusMode) {
        case '客户':
          ret = TaskStage.client;
          break;
        case '导演':
          ret = TaskStage.director;
          break;
        case '组长':
          ret = TaskStage.leader;
          break;
        default:
          ret = TaskStage.client;
      }
      return ret;
    },
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
      // By status

      const status = this.getGeneralStatus(video.uuid, this.statusStage);
      if (!this.statusSelect[status]) {
        return false;
      }
      // By label
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
    StatusSelect,
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
