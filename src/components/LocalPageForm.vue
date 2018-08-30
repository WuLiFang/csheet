<template lang="pug">
  ElForm(
    label-width='80px'
    :model='form'
    :rules='rules'
    ref='form'
  )
    ElFormItem(label='路径' prop='root')
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
      rules: {
        root: [
          { required: true, message: '请填写文件夹路径', trigger: 'blur' },
          {
            validator: (
              rule: any,
              value: string,
              callback: (error?: Error) => void,
            ) => {
              if (!(/^\/.*/.test(value) || /^\w:[\\/].*/.test(value))) {
                callback(new Error('请使用绝对路径'));
              } else if (/^\/$/.test(value) || /^\w:[\\/]$/.test(value)) {
                callback(new Error('不允许使用根目录'));
              } else {
                callback();
              }
            },
          },
        ],
      },
    };
  },
  computed: {
    formComponent(): ElForm {
      return this.$refs.form as ElForm;
    },
  },
  methods: {
    open() {
      this.formComponent.validate((valid: boolean) => {
        if (valid) {
          showFullScreenLoading();
          location.href = buildURL('local', this.form);
        }
      });
    },
    pack() {
      this.formComponent.validate((valid: boolean) => {
        if (valid) {
          showFullScreenLoading();
          location.href = buildURL('local', { ...this.form, pack: '1' });
        }
      });
    },
  },
});
</script>
