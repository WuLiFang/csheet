<template lang="pug">
  ElForm(
    label-width='80px'
    :model='form'
    :rules='rules'
    ref='form'
    @submit.native.prevent='open'
  )
    ElFormItem(label='项目' prop='project')
      ElSelect(v-model='form.project' @change='setDefaultPrefix')
        ElOption(v-for='i in projects' :key='i.code', :value='i.name')
    ElFormItem(label='流程' prop='pipeline')
      ElRadio(v-model='form.pipeline' label='合成')
      ElRadio(v-model='form.pipeline' label='灯光')
      ElRadio(v-model='form.pipeline' label='动画')
      ElRadio(v-model='form.pipeline' label='特效')
    ElFormItem(label='前缀' prop='prefix')
      ElInput(v-model='form.prefix' ref='inputPrefix' @keyup.native.enter='open')
    ElFormItem
      ElButton(type='primary' @click='open') 打开
      ElButton(icon="el-icon-message" @click='pack') 打包

</template>
<script lang="ts">
import { buildURL, getCookie } from '@/datatools';
import { projects, showFullScreenLoading } from '@/index';
import Vue from 'vue';

import {
  Button as ElButton,
  Form as ElForm,
  FormItem as ElFormItem,
  Input as ElInput,
  Option as ElOption,
  Radio as ElRadio,
  Select as ElSelect,
} from 'element-ui';

export default Vue.extend({
  components: {
    ElButton,
    ElForm,
    ElFormItem,
    ElInput,
    ElOption,
    ElRadio,
    ElSelect,
  },
  data() {
    return {
      form: {
        pipeline: getCookie('pipeline'),
        prefix: getCookie('prefix'),
        project: getCookie('project'),
      },
      is_opening: false,
      projects,
      rules: {
        pipeline: [
          { required: true, message: '请选择流程', trigger: 'change' },
        ],
        prefix: [
          { required: true, message: '请输入前缀', trigger: 'blur' },
          {
            trigger: 'blur',
            validator: (
              rule: any,
              value: string,
              callback: (error?: Error) => void
            ) => {
              if (!value.includes('_')) {
                callback(new Error('至少包含一个下划线`_`'));
              } else {
                callback();
              }
            },
          },
        ],
        project: [{ required: true, message: '请选择项目', trigger: 'blur' }],
      },
    };
  },

  methods: {
    inputPrefix(): HTMLInputElement {
      return (this.$refs.inputPrefix as ElInput).$refs
        .input as HTMLInputElement;
    },
    formComponent(): ElForm {
      return this.$refs.form as ElForm;
    },
    open() {
      this.formComponent().validate((valid: boolean) => {
        if (valid) {
          showFullScreenLoading();
          location.href = buildURL('', this.form);
        }
      });
    },
    pack() {
      this.formComponent().validate((valid: boolean) => {
        if (valid) {
          showFullScreenLoading();
          location.href = buildURL('', this.form);
          location.href = buildURL('', { ...this.form, pack: '1' });
        }
      });
    },
    setDefaultPrefix() {
      const project = this.projects.find(i => i.name === this.form.project);
      if (!project) {
        return;
      }
      this.form.prefix = `${project.code}_EP01`;

      this.$nextTick(() => {
        this.inputPrefix().focus();
        this.inputPrefix().setSelectionRange(
          project.code.length + 3,
          project.code.length + 5
        );
      });
    },
  },
});
</script>
