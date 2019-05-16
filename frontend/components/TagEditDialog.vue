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
import { ITagResponse, IVideoResponse } from '@/interface';
import { IVideoTagsUpdateActionPayload, VIDEO_TAGS } from '@/mutation-types';
import { tagComputedMixin } from '@/store/tag';
import { videoComputedMixin } from '@/store/video';
import _ from 'lodash';
import Vue from 'vue';

import { default as TagSelect } from '@/components/TagSelect.vue';
import {
  Button as ElButton,
  Dialog as ElDialog,
  Message,
  Notification,
} from 'element-ui';

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
    ...videoComputedMixin,
    ...tagComputedMixin,
    isVisible: {
      get(): boolean {
        return this.visible;
      },
      set(value: boolean) {
        this.$emit('update:visible', value);
      },
    },
    video(): IVideoResponse | undefined {
      return this.videoStore.storage[this.id];
    },
    selectedTags(): ITagResponse[] {
      return _.flatMap(this.tagSelectModel, i => this.tagStoreByText[i] || []);
    },
  },
  methods: {
    reset() {
      if (!this.video) {
        return;
      }
      this.tagSelectModel = this.video.tags.map(
        i => this.tagStore.storage[i]!.text
      );
    },
    accept() {
      const payload: IVideoTagsUpdateActionPayload = {
        data: {
          tags: this.selectedTags.map(i => i.id),
        },
        id: this.id,
      };
      this.$store
        .dispatch(VIDEO_TAGS.UPDATE, payload)
        .then(() => {
          Message({ message: '编辑标签成功', type: 'success' });
        })
        .catch(reason => {
          Notification({
            message: String(reason),
            title: '编辑标签失败',
            type: 'error',
          });
        });
      this.isVisible = false;
    },
    reject() {
      this.isVisible = false;
    },
  },
  watch: {
    visible(value: boolean) {
      if (value) {
        this.reset();
      }
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
