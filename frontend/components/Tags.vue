<template lang="pug">
  .tags
    Tag(v-for='i in tags' :key='i.id' @close='deleteVideoTag(i)' closable size='small') {{ i.text }}
    Button(v-if='!isFileProtocol' @click='isTagEditDialogVisible = true' size='mini') 编辑标签
    TagEditDialog(:id='id' :visible.sync='isTagEditDialogVisible')
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { TagResponse, VideoResponse } from '@/interface';
import { VideoTagsDeleteActionPayload, VIDEO_TAGS } from '@/mutation-types';
import { isFileProtocol } from '@/packtools';
import TagEditDialog from '@/components/TagEditDialog.vue';
import { Tag, Button } from 'element-ui';

@Component({
  components: { Tag, Button, TagEditDialog },
})
export default class Tags extends Vue {
  @Prop(String)
  public id!: string;

  private isFileProtocol = isFileProtocol;
  private isTagEditDialogVisible = false;

  get video(): VideoResponse {
    return this.$store.state.videoStore.storage[this.id];
  }
  get tags(): TagResponse[] {
    return this.video.tags.map(i => this.$store.state.tagStore.storage[i]);
  }
  private deleteVideoTag(tag: TagResponse) {
    const payload: VideoTagsDeleteActionPayload = {
      id: this.video.uuid,
      data: {
        tags: [tag.id],
      },
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
