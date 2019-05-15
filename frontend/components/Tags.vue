<template lang="pug">
  .tags
    Tag(v-for='i in tags' :key='i.id' @close='deleteVideoTag(i)' closable size='small') {{ i.text }}
    Button(v-if='!isFileProtocol' @click='isTagEditDialogVisible = true' size='mini') 编辑标签
    TagEditDialog(:id='id' :visible.sync='isTagEditDialogVisible')
</template>

<script lang="ts">
import { ITagResponse, IVideoResponse } from '@/interface';
import { IVideoTagsDeleteActionPayload, VIDEO_TAGS } from '@/mutation-types';
import { isFileProtocol } from '@/packtools';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { default as TagEditDialog } from '@/components/TagEditDialog.vue';
import { Button, Tag } from 'element-ui';

@Component({
  components: { Tag, Button, TagEditDialog },
})
export default class Tags extends Vue {
  @Prop(String)
  public id!: string;

  public isFileProtocol = isFileProtocol;
  public isTagEditDialogVisible = false;

  get video(): IVideoResponse {
    return this.$store.state.videoStore.storage[this.id];
  }
  get tags(): ITagResponse[] {
    return this.video.tags.map(i => this.$store.state.tagStore.storage[i]);
  }

  public deleteVideoTag(tag: ITagResponse) {
    const payload: IVideoTagsDeleteActionPayload = {
      data: {
        tags: [tag.id],
      },
      id: this.video.uuid,
    };
    this.$store.dispatch(VIDEO_TAGS.DELETE, payload);
  }
}
</script>
<style lang="scss" scoped>
.tags {
  .el-button {
    display: block !important;
  }
}
</style>
