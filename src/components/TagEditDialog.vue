<template lang="pug">
  ElDialog.tag-edit-dialog(
    modal-append-to-body
    append-to-body
    :visible.sync='isVisible'
    :title='`编辑标签: ${video.label}`'
    )
    TagSelect(v-model='tagSelectModel' allow-create size='') 
    span(slot='footer')
      ElButton(@click='reject') 取消
      ElButton(@click='reset') 重置
      ElButton(@click='accept' type='primary') 确定
</template>

<script lang="ts">
import Vue from 'vue';

import _ from 'lodash';
import {
  Tag as ElTag,
  Input as ElInput,
  Button as ElButton,
  Dialog as ElDialog,
  Message,
  Notification,
} from 'element-ui';

import TagSelect from './TagSelect.vue';
import { VideoResponse, TagResponse } from '@/interface';
import { videoComputedMinxin } from '@/store/video';
import { tagComputedMinxin } from '@/store/tag';
import { VideoTagsUpdateActionPayload, VIDEO_TAGS } from '@/mutation-types';

export default Vue.extend({
  components: {
    ElButton,
    ElDialog,
    TagSelect,
  },
  props: {
    id: { type: String },
    visible: { default: false },
  },
  data() {
    return {
      tagSelectModel: [] as string[],
    };
  },
  computed: {
    ...videoComputedMinxin,
    ...tagComputedMinxin,
    isVisible: {
      get(): boolean {
        return this.visible;
      },
      set(value: boolean) {
        this.$emit('update:visible', value);
      },
    },
    video(): VideoResponse {
      return this.videoStore.storage[this.id];
    },
    selectedTags(): TagResponse[] {
      return _.flatMap(this.tagSelectModel, i => this.tagStoreByText[i]);
    },
  },
  watch: {
    visible(value: boolean) {
      if (value) {
        this.reset();
      }
    },
  },
  methods: {
    reset() {
      this.tagSelectModel = this.video.tags.map(
        i => this.tagStore.storage[i].text,
      );
    },
    accept() {
      const payload: VideoTagsUpdateActionPayload = {
        id: this.id,
        data: {
          tags: this.selectedTags.map(i => i.id),
        },
      };
      this.$store
        .dispatch(VIDEO_TAGS.UPDATE, payload)
        .then(() => {
          Message({ message: '编辑标签成功', type: 'success' });
        })
        .catch(reason => {
          Notification({
            title: '编辑标签失败',
            message: String(reason),
            type: 'error',
          });
        });
      this.isVisible = false;
    },
    reject() {
      this.isVisible = false;
    },
  },
});
</script>
<style lang="scss" scoped>
.tag-edit-dialog {
  .tag-select {
    width: 100%;
  }
}
</style>
