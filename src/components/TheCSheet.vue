<template lang="pug">
  div.the-csheet
    div.control
      div {{avaliableCount}}/{{totalCount}}
      div
        ElCheckbox(v-model='isShowTitle') 标题
      div
        ElCheckbox(v-if='hasTaskStorage' v-model='isShowStatus') 任务信息
      div.mode(v-show='isShowStatus')
        ElSelect(v-model='statusStage' size='mini')
          .prefix(slot='prefix')
            span 阶段
          ElOption(label='组长' :value='TaskStage.leader')
          ElOption(label='导演' :value='TaskStage.director')
          ElOption(label='客户' :value='TaskStage.client')
        StatusSelect(:select.sync='statusSelect')
      div 
        ElInput.filter(
          size='mini'
          placeholder='正则过滤' 
          prefix-icon='el-icon-search'
          v-model='filterText'
        )
        button(
          v-show='filterText'
          @click='filterText = ""'
        ) 重置
      div.pack(v-if='isShowPack')
        a(:href="packURL" :download="packFilename" @click='isShowPack = false')
          ElButton(icon="el-icon-message" size='mini') 打包
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
import {
  Input as ElInput,
  Checkbox as ElCheckbox,
  Button as ElButton,
  Select as ElSelect,
  Option as ElOption,
  RadioGroup as ElRadioGroup,
  RadioButton as ElRadioRadioButton,
} from 'element-ui';

import { isFileProtocol } from '../packtools';
import { videoComputedMinxin } from '../store/video';
import { VideoResponse, TaskStage, TaskStatus } from '../interface';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';

export default Vue.extend({
  components: {
    Lightbox,
    TheCSheetViewer,
    StatusSelect,
    ElInput,
    ElCheckbox,
    ElButton,
    ElSelect,
    ElOption,
  },
  data() {
    return {
      current: null as string | null,
      isShowTitle: false,
      isShowStatus: false,
      isShowPack: isFileProtocol ? false : true,
      statusStage: TaskStage.director,
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
      TaskStage,
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
      // By status

      const status = this.getGeneralStatus(video.uuid, this.statusStage);
      if (status !== null && !this.statusSelect[status]) {
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

  updated() {
    this.count();
  },
  mounted() {
    this.count();
  },
});
</script>

<style lang="scss" scoped>
.the-csheet {
  display: flex;
  position: relative;
  flex-wrap: wrap;
  justify-content: center;
  width: 85vw;
  margin: auto;
  .control {
    position: fixed;
    color: gray;
    right: 0;
    top: 0;
    margin: 0.5%;
    text-align: right;
    .mode {
      .el-select {
        width: 6em;
        .prefix {
          height: 100%;
          display: inline-flex;
          align-items: center;
        }
      }
    }
    .filter {
      width: 10em;
      text-align: right;
      margin: 1em 0;
    }
    .pack {
      margin-top: 1em;
      margin-bottom: 1em;
    }
  }
  &:hover {
    border-left: 1px dotted rgba(255, 255, 255, 0.3);
    border-right: 1px dotted rgba(255, 255, 255, 0.3);
  }
}
</style>
<style lang="scss">
body {
  margin: 0;
  background: black;
}
</style>
