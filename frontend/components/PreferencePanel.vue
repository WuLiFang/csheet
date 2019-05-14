<template lang="pug">
  .preference-panel
    FileCount
    .preference
      .video(v-if='videoPlayList.length > 0')
        ElCheckbox(v-model='isEnablePreviewModel') 视频
      .title
        ElCheckbox(v-model='isFixedTitleDisplayModel') 标题
      .status
        ElCheckbox(
          v-if='hasTaskStorage'
          v-model='isFixedStatusDisplayModel'
        ) 任务信息
    .filter
      .status
        ElSelect.mode(
          v-model='statusStageModel'
          v-show='isFixedStatusDisplayModel'
          size='mini' )
          .prefix(slot='prefix')
            span 阶段
          ElOption(label='组长' :value='TaskStage.leader')
          ElOption(label='导演' :value='TaskStage.director')
          ElOption(label='客户' :value='TaskStage.client')
        StatusSelect(
          v-show='isFixedStatusDisplayModel'
          v-model='statusFilterModel')
      .label
        ElInput(
          size='mini'
          placeholder='标题正则过滤'
          prefix-icon='el-icon-search'
          v-model='labelFilterModel'
        )
      .artist(v-if='artists.length > 0')
        ArtistSelect(
          v-model='artistFilterModel'
          size='mini'
          prefix-icon='el-icon-info'
          placeholder='人员过滤'
        )
        ElCheckbox(
          v-model='isFilterUser'
          v-show='currentUserTaskCount'
        ) 当前用户({{currentUserTaskCount}})
      .tag(v-if='tags.length > 0')
        TagSelect(
          v-model='tagTextFilterModel'
          size='mini'
          placeholder='标签过滤')
      .buttons
        ElButton(
          v-if='!isFileProtocol'
          v-show='!isEditingTagsModel'
          size='mini'
          icon='el-icon-edit'
          @click='isEditingTagsModel = true'
        ) 添加标签
        ElButton(
          size='mini'
          v-show='isFilterEnabled'
          @click='resetFilters'
        ) 重置过滤
</template>
<script lang="ts">
import Vue from 'vue';

import _ from 'lodash';

import {
  Input as ElInput,
  Checkbox as ElCheckbox,
  Button as ElButton,
  Select as ElSelect,
  Option as ElOption,
  Autocomplete as ElAutocomplete,
} from 'element-ui';

import { default as FileCount } from '@/components/FileCount.vue';
import { default as StatusSelect } from '@/components/StatusSelect.vue';
import { default as TagSelect } from '@/components/TagSelect.vue';
import { default as ArtistSelect } from '@/components/ArtistSelect.vue';

import { mapRootStateModelMixin, getDefaultStatusFilter } from '@/store';

import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { TaskStage, TaskStatus } from '@/interface';
import { isFileProtocol } from '@/packtools';
import { videoComputedMixin } from '@/store/video';
import { tagComputedMixin } from '@/store/tag';
import { USERNAME } from '@/constants';

// @ts-ignore
export default Vue.extend({
  components: {
    StatusSelect,
    TagSelect,
    ElInput,
    ElCheckbox,
    ElButton,
    ElSelect,
    ElOption,
    ElAutocomplete,
    ArtistSelect,
    FileCount,
  },
  data() {
    return {
      TaskStage,
      isFileProtocol,
    };
  },
  computed: {
    ...CGTeamWorkTaskComputedMixin,
    ...mapRootStateModelMixin,
    ...videoComputedMixin,
    ...tagComputedMixin,
    hasTaskStorage(): boolean {
      // @ts-ignore
      return !_.isEmpty(this.cgTeamworkTaskStore.storage);
    },
    isFilterUser: {
      get(): boolean {
        return (
          // @ts-ignore
          this.artistFilterModel.length === 1 &&
          // @ts-ignore
          this.artistFilterModel[0] === USERNAME
        );
      },
      set(value: boolean) {
        if (value) {
          // @ts-ignore
          this.artistFilterModel = [USERNAME];
        } else {
          // @ts-ignore
          this.artistFilterModel = [];
        }
      },
    },
    currentUserTaskCount(): number {
      // @ts-ignore
      return this.getArtistTaskCount(USERNAME);
    },
    isFilterEnabled() {
      const defaultStatusFilter = getDefaultStatusFilter();
      return (
        // @ts-ignore
        this.labelFilterModel ||
        // @ts-ignore
        this.artistFilterModel.length > 0 ||
        // @ts-ignore
        this.tagTextFilterModel.length > 0 ||
        // @ts-ignore
        Object.keys(this.statusFilterModel).some(i => {
          const key = <keyof typeof TaskStatus>i;
          // @ts-ignore
          return this.statusFilterModel[key] !== defaultStatusFilter[key];
        })
      );
    },
  },
  methods: {
    resetFilters() {
      // @ts-ignore
      this.labelFilterModel = '';
      // @ts-ignore
      this.artistFilterModel = [];
      // @ts-ignore
      this.tagTextFilterModel = [];
      // @ts-ignore
      this.statusFilterModel = getDefaultStatusFilter();
    },
  },
});
</script>

<style lang="scss" scoped>
.preference-panel {
  div:not(.file-count) {
    display: flex;
    flex-direction: column;
  }
  .mode {
    width: 6em;
    align-self: flex-end;
    .prefix {
      height: 100%;
      display: inline-flex;
      justify-content: center;
    }
  }
  .filter,
  .preference {
    margin: 0.5em 0;
  }
  .pack {
    margin: 1em 0;
  }
}
</style>
<style lang="scss">
.preference-panel {
  .filter {
    .el-input {
      width: 10em;
    }
  }
}
</style>
