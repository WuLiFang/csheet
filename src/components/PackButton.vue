<template lang="pug">
.pack-button(v-if='isVisible')
  a(:href="url" :download="filename" @click='isVisible = false')
    ElButton(icon="el-icon-message" size='mini') 打包
</template>

<script lang="ts">
import Vue from 'vue';

import { Button as ElButton } from 'element-ui';
import { isFileProtocol } from '@/packtools';

export default Vue.extend({
  components: {
    ElButton,
  },
  data() {
    return {
      isVisible: !isFileProtocol,
    };
  },
  computed: {
    url(): string {
      return `${window.location.origin}${window.location.pathname}${window
        .location.search || '?'}&pack=1`;
    },
    filename(): string {
      return `${document.title}.zip`;
    },
  },
});
</script>
