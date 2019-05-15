<template lang="pug">
  .select-toolbar(v-if='!isFileProtocol' v-show='isEditingTags')
    span.label 为所选添加标签
    TagSelect(v-model='selectedTagsText' size='mini' allow-create=true)
    ElButtonGroup
      ElButton(@click='selectAll', size='mini' icon='el-icon-edit') 全选
      ElButton(@click='reverseSelection', size='mini' icon='el-icon-edit') 反选
      ElButton(@click='accept', size='mini' icon='el-icon-check' type="primary" :disabled='!isAllowAccept') 确定
      ElButton(@click='reject', size='mini' icon='el-icon-close' type="info") 取消

</template>

<script lang="ts">
import { ITagResponse } from '@/interface';
import {
  IVideosAddTagActionPayload,
  UPDATE_VIDEO_SELECT_STATE,
  VIDEOS_ADD_TAG,
  VideoUpdateSelectStateMutationPayload,
} from '@/mutation-types';
import { isFileProtocol } from '@/packtools';
import { mapIRootStateModelMixin, RootComputedMixin } from '@/store';
import { tagComputedMixin } from '@/store/tag';
import { videoComputedMixin } from '@/store/video';
import Vue from 'vue';

import TagSelect from '@/components/TagSelect.vue';
import {
  Button as ElButton,
  ButtonGroup as ElButtonGroup,
  Message,
  Notification,
} from 'element-ui';

export default Vue.extend({
  components: {
    ElButton,
    ElButtonGroup,
    TagSelect,
  },
  data() {
    return {
      isFileProtocol,
      selectedTagsText: [] as string[],
    };
  },
  computed: {
    ...RootComputedMixin,
    ...tagComputedMixin,
    ...videoComputedMixin,
    ...mapIRootStateModelMixin,
    selectedTags(): ITagResponse[] {
      return this.getTagByTextArray(this.selectedTagsText);
    },
    isAllowAccept(): boolean {
      return this.selectedTags.length > 0 && this.selectedVideos.length > 0;
    },
  },
  methods: {
    selectAll() {
      const payload: VideoUpdateSelectStateMutationPayload = {};
      this.videoStore.visibleVideos.map(i => {
        payload[i] = true;
      });
      this.$store.commit(UPDATE_VIDEO_SELECT_STATE, payload);
    },
    reverseSelection() {
      const payload: VideoUpdateSelectStateMutationPayload = {};
      this.videoStore.visibleVideos.map(i => {
        const old = this.videoStore.selectStateMap[i] || false;
        payload[i] = !old;
      });
      this.$store.commit(UPDATE_VIDEO_SELECT_STATE, payload);
    },
    clearSelection() {
      const payload: VideoUpdateSelectStateMutationPayload = {};
      Object.keys(this.videoStore.storage).map(i => {
        payload[i] = false;
      });
      this.$store.commit(UPDATE_VIDEO_SELECT_STATE, payload);
    },
    accept() {
      Promise.all(
        this.selectedTags.map(i => {
          const payload: IVideosAddTagActionPayload = {
            data: { videos: this.selectedVideos },
            id: i.id,
          };
          return this.$store.dispatch(VIDEOS_ADD_TAG, payload);
        })
      )
        .then(() => {
          Message({ message: '添加标签成功', type: 'success' });
          this.clearSelection();
        })
        .catch(reason => {
          Notification({
            message: String(reason),
            title: '添加标签失败',
            type: 'error',
          });
        });
      this.isEditingTagsModel = false;
    },
    reject() {
      this.clearSelection();
      this.isEditingTagsModel = false;
      Message('取消编辑');
    },
  },
});
</script>
