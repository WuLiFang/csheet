<template lang="pug">
    dl.file-info(v-if='videoData')
      template(v-show='videoData.poster_mtime')
        dt
          span 图像
          FaIcon.icon(name='regular/file-image')
        dd
          RelativeTime(:value='videoData.poster_mtime')
          .path(v-show='videoData.poster' :data-clipboard-text='videoData.poster') {{videoData.poster}}
      template(v-show='videoData.src_mtime || videoData.preview_mtime')
        dt
          span 视频
          FaIcon.icon(name='regular/file-video')
        dd
          RelativeTime(:value='videoData.src_mtime || videoData.preview_mtime')
          .message(v-show='videoData.preview_mtime != videoData.src_mtime')
            span.outdated(v-if='videoData.preview_mtime')
              | 预览非最新:
              RelativeTime(:value='videoData.preview_mtime')
            span.outdated(v-if='!videoData.src_mtime && videoData.preview_mtime')
              | 源文件已删除
            span.broken(v-else-if='videoData.src_broken_mtime')
              span.outdated 转码失败
              ElButton(@click='retryTranscode' size='mini') 重试
            span.notready(v-else)
              | 预览未就绪: 等待转码
          .path(v-show='videoData.src' :data-clipboard-text='videoData.src') {{videoData.src}}
</template>


<script lang="ts">
import Vue from 'vue';

import { Button as ElButton, Message } from 'element-ui';
import { default as FaIcon } from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/regular/file-image';
import 'vue-awesome/icons/regular/file-video';

import { default as RelativeTime } from '@/components/RelativeTime.vue';

import { IVideoResponse } from '@/interface';
import { IVideoUpdateActionPayload, VIDEO } from '@/mutation-types';
import { videoComputedMixin } from '@/store/video';
import clipboard from 'clipboard';

export default Vue.extend({
  components: {
    ElButton,
    FaIcon,
    RelativeTime,
  },
  computed: {
    ...videoComputedMixin,
    videoData(): IVideoResponse | undefined {
      return this.videoStore.storage[this.id];
    },
  },
  data(): { clipboard?: clipboard } {
    return {
      clipboard: undefined,
    };
  },
  props: { id: { type: String } },

  methods: {
    retryTranscode() {
      const payload: IVideoUpdateActionPayload = {
        data: {
          key: 'src_broken_mtime',
          value: null,
        },
        id: this.id,
      };
      this.$store.dispatch(VIDEO.UPDATE, payload);
    },
  },

  destroyed() {
    if (this.clipboard) {
      this.clipboard.destroy();
    }
  },
  mounted() {
    this.clipboard = new clipboard('.path', { container: this.$el });
    this.clipboard.on('success', () => {
      Message.success('已复制');
    });
    this.clipboard.on('error', () => {
      Message.error('使用 Ctrl + C 复制');
    });
  },
});
</script>
<style lang="scss" scoped>
.file-info {
  display: inline-block;
  margin: 5px;
  .icon {
    vertical-align: -0.15em;
    margin: 0 0.2em;
  }
  .message {
    .outdated {
      background: crimson;
    }
    .notready {
      background: darkorange;
    }
  }
  .relative-time {
    margin: 0;
  }
  color: white;
  opacity: 0.5;
  text-align: left;
  transition: 0.2s ease-in-out;
  .path {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 10em;
    &:hover {
      text-decoration: underline;
    }
  }
  &:hover {
    background: black;
    opacity: 1;
    .path {
      max-width: 100%;
    }
  }
}
</style>
