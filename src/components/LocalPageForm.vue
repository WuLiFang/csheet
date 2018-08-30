<template lang="pug">
  ElForm(
    label-width='80px' 
  )
    ElFormItem(label='路径')
      ElInput(v-model='form.root')
    ElFormItem
      ElButton(type='primary' @click='open') 打开
      ElButton(icon="el-icon-message" @click='pack') 打包

</template>
<script lang="ts">
import Vue from 'vue';

import {
  Input as ElInput,
  Button as ElButton,
  Radio as ElRadio,
  Select as ElSelect,
  Option as ElOption,
  Form as ElForm,
  FormItem as ElFormItem,
} from 'element-ui';
import { projects, showFullScreenLoading } from '@/index';
import { getCookie, buildURL } from '@/datatools';
import { setInterval } from 'timers';

export default Vue.extend({
  components: {
    ElForm,
    ElFormItem,
    ElButton,
    ElInput,
  },
  data() {
    return {
      form: {
        root: getCookie('root', 'Y:\\资源\\动态素材\\灰、尘、土'),
      },
    };
  },
  methods: {
    open() {
      showFullScreenLoading();
      location.href = buildURL('local', this.form);
    },
    pack() {
      showFullScreenLoading();
      location.href = buildURL('local', { ...this.form, pack: '1' });
    },
  },
});
</script>
