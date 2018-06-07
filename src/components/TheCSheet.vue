<template lang="pug">
  div.the-csheet
    .select-toolbar(v-show='isEditingTags')
      span.label 为所选添加标签
      TagSelect(v-model='selectedTagTextArray' size='mini' allow-create=true)
      ElButtonGroup
        ElButton(@click='selectAll', size='mini' icon='el-icon-edit') 全选
        ElButton(@click='reverseSelection', size='mini' icon='el-icon-edit') 反选
        ElButton(@click='accept', size='mini' icon='el-icon-check' type="primary" :disabled='selectedTags.length === 0 || selectedVideos.length === 0') 确定
        ElButton(@click='reject', size='mini' icon='el-icon-close' type="info") 取消
    .control(v-show='!current')
      .count {{avaliableCount}}/{{totalCount}}
      .title
        ElCheckbox(v-model='isShowTitle') 标题
      .status
        ElCheckbox(v-if='hasTaskStorage' v-model='isShowStatus') 任务信息
        ElSelect.mode(v-model='statusStage' v-show='isShowStatus' size='mini')
          .prefix(slot='prefix')
            span 阶段
          ElOption(label='组长' :value='TaskStage.leader')
          ElOption(label='导演' :value='TaskStage.director')
          ElOption(label='客户' :value='TaskStage.client')
        StatusSelect(v-show='isShowStatus' :select.sync='statusSelect')
      .filter
        .label
          ElInput(
            size='mini'
            placeholder='标题正则过滤' 
            prefix-icon='el-icon-search'
            v-model='filterText'
          )
        .artist(v-if='artists.length > 0')
          ElAutocomplete(
            v-model='filterArtist'
            :fetch-suggestions='artistSearch'
            size='mini'
            prefix-icon='el-icon-info'
            placeholder='人员过滤' 
          )
          ElCheckbox(v-model='isFilterUser' v-show='myTaskCount') 当前用户({{myTaskCount}})
        .tag
          TagSelect(v-model='filterTagTextArray' size='mini' placeholder='标签过滤')
        .buttons
          ElButton(@click='editTag', size='mini' icon='el-icon-edit' v-show='!isEditingTags' ) 添加标签
          ElButton(
            size='mini'
            v-show='filterText || filterArtist'
            @click='filterText = ""; filterArtist = ""; filterTagTextArray = []'
          ) 重置过滤
      div.pack(v-if='isShowPack')
        a(:href="packURL" :download="packFilename" @click='isShowPack = false')
          ElButton(icon="el-icon-message" size='mini') 打包
    Lightbox(
      v-for='video in videos'
      v-model='videoSelectState[video.uuid]'
      :id='video.uuid' 
      :key='video.label' 
      :isSelectable='isEditingTags'
      :isVisible='visibleVideos.includes(video)'
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
import TagSelect from './TagSelect.vue';
import {
  Input as ElInput,
  Checkbox as ElCheckbox,
  Button as ElButton,
  ButtonGroup as ElButtonGroup,
  Select as ElSelect,
  Option as ElOption,
  RadioGroup as ElRadioGroup,
  RadioButton as ElRadioRadioButton,
  Autocomplete as ElAutocomplete,
  Notification,
  Message,
} from 'element-ui';

import { isFileProtocol } from '../packtools';
import { videoComputedMinxin } from '../store/video';
import {
  VideoResponse,
  TaskStage,
  TaskStatus,
  CGTeamWorkTaskData,
  TagResponse,
} from '../interface';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { tagComputedMinxin } from '@/store/tag';
import { isUndefined } from 'util';
import {
  TagUpdateActionPayload,
  VideosAddTagActionPayload,
  VIDEOS_ADD_TAG,
} from '@/mutation-types';

interface VideoSelectState {
  [id: string]: boolean | undefined;
}

export default Vue.extend({
  components: {
    Lightbox,
    TheCSheetViewer,
    StatusSelect,
    TagSelect,
    ElInput,
    ElCheckbox,
    ElButton,
    ElButtonGroup,
    ElSelect,
    ElOption,
    ElAutocomplete,
  },
  data() {
    return {
      current: null as string | null,
      isShowTitle: false,
      isShowStatus: false,
      isShowPack: isFileProtocol ? false : true,
      statusStage: TaskStage.director,
      filterText: '',
      filterArtist: '',
      filterTagTextArray: [] as string[],
      selectedTagTextArray: [] as string[],
      videoSelectState: {} as VideoSelectState,
      isEditingTags: false,
      avaliableCount: -1,
      totalCount: -1,
      statusSelect: {
        [TaskStatus.Close]: false,
        [TaskStatus.Retake]: true,
        [TaskStatus.Wait]: true,
        [TaskStatus.Check]: true,
        [TaskStatus.Approve]: true,
        other: true,
      } as StatusSelectResult,
      TaskStage,
    };
  },
  computed: {
    ...videoComputedMinxin,
    ...CGTeamWorkTaskComputedMixin,
    ...tagComputedMinxin,
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
    myTaskCount(): number {
      return this.getAritstTaskCount(this.$store.state.username);
    },
    isFilterUser: {
      get(): boolean {
        return this.filterArtist === this.$store.state.username;
      },
      set(value: boolean) {
        if (value) {
          this.filterArtist = this.$store.state.username;
        } else {
          this.filterArtist = '';
        }
      },
    },
    visibleVideos(): VideoResponse[] {
      return this.videos.filter(this.filter);
    },
    selectedVideos(): VideoResponse[] {
      return Object.keys(this.videoSelectState)
        .filter(i => this.videoSelectState[i])
        .map(i => this.videoStore.storage[i]);
    },
    filterTags(): TagResponse[] {
      return this.getTagByTextArray(this.filterTagTextArray);
    },
    selectedTags(): TagResponse[] {
      return this.getTagByTextArray(this.selectedTagTextArray);
    },
  },
  methods: {
    onclick(video: VideoResponse) {
      this.current = video.uuid;
    },
    filter(video: VideoResponse): boolean {
      return (
        this.filterByArtist(video) &&
        this.filterByTag(video) &&
        this.filterByStatus(video) &&
        this.filterByLabel(video)
      );
    },
    filterByStatus(video: VideoResponse): boolean {
      const status = this.getGeneralStatus(video.uuid, this.statusStage);

      if (status === null && !this.statusSelect.other) {
        return false;
      } else if (status !== null && !this.statusSelect[status]) {
        return false;
      }
      return true;
    },
    filterByLabel(video: VideoResponse): boolean {
      if (!this.filterText) {
        return true;
      }
      return new RegExp(this.filterText, 'i').test(video.label);
    },
    filterByArtist(video: VideoResponse): boolean {
      if (!this.filterArtist) {
        return true;
      }
      return video.related_tasks.some(i => {
        const task = this.cgTeamworkTaskStore.storage[i];
        if (!task) {
          return false;
        }
        return task.artist_array.indexOf(this.filterArtist) >= 0;
      });
    },
    filterByTag(video: VideoResponse): boolean {
      if (!this.filterTags) {
        return true;
      }
      return this.filterTags.every(i => {
        return video.tags.includes(i.id);
      });
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
    artistSearch(queryString: string, cb: (result: any[]) => void) {
      const result = queryString
        ? this.artists.filter(i => i.includes(queryString))
        : this.artists;
      cb(
        result.map(i => {
          return {
            value: i,
          };
        }),
      );
    },
    editTag() {
      this.isEditingTags = true;
    },
    reverseSelection() {
      this.visibleVideos.map(i => {
        const old = this.videoSelectState[i.uuid];
        Vue.set(this.videoSelectState, i.uuid, isUndefined(old) ? true : !old);
      });
    },
    clearSelection() {
      Object.keys(this.videoSelectState).map(i => {
        Vue.set(this.videoSelectState, i, false);
      });
    },
    selectAll() {
      this.visibleVideos.map(i => {
        Vue.set(this.videoSelectState, i.uuid, true);
      });
    },
    accept() {
      Promise.all(
        this.selectedTags.map(i => {
          const payload: VideosAddTagActionPayload = {
            id: i.id,
            data: { videos: this.selectedVideos.map(j => j.uuid) },
          };
          return this.$store.dispatch(VIDEOS_ADD_TAG, payload);
        }),
      )
        .then(() => {
          Message({ message: '添加标签成功', type: 'success' });
          this.clearSelection();
        })
        .catch(reason => {
          Notification({
            title: '添加标签失败',
            message: String(reason),
            type: 'error',
          });
        });

      this.isEditingTags = false;
    },
    reject() {
      this.clearSelection();
      this.isEditingTags = false;
      Message('取消编辑');
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
  .select-toolbar {
    display: flex;

    position: fixed;
    background: rgba($color: orange, $alpha: 0.5);
    width: 100%;
    height: 2em;
    text-align: center;
    justify-content: center;
    align-items: center;
    z-index: 10;
    .label {
      padding: 1em;
      color: white;
    }
  }

  .control {
    div {
      display: flex;
      flex-direction: column;
    }
    position: fixed;
    color: gray;
    right: 0;
    top: 0;
    margin: 0.5%;
    text-align: right;
    .mode {
      width: 6em;
      align-self: flex-end;
      .prefix {
        height: 100%;
        display: inline-flex;
        justify-content: center;
      }
    }
    .filter {
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
.the-csheet {
  .control {
    .filter {
      .el-input {
        width: 10em;
      }
    }
  }
}
</style>
