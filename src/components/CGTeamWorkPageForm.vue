<template lang="pug">
  ElForm(
    label-width='80px'
    :model='form'
    :rules='rules'
    ref='form'
  )
    ElFormItem(label='项目' prop='project')
      ElSelect(v-model='form.project' @change='setDefaultPrefix')
        ElOption(v-for='i in projects' :key='i.code', :value='i.name')
    ElFormItem(label='流程' prop='pipeline')
      ElRadio(v-model='form.pipeline' label='合成')
      ElRadio(v-model='form.pipeline' label='灯光')
      ElRadio(v-model='form.pipeline' label='动画')
    ElFormItem(label='前缀' prop='prefix')
      ElInput(v-model='form.prefix' ref='inputPrefix')
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

export default Vue.extend({
  components: {
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElButton,
    ElRadio,
    ElInput,
  },
  data() {
    return {
      form: {
        project: getCookie('project'),
        pipeline: getCookie('pipeline'),
        prefix: getCookie('prefix'),
      },
      rules: {
        project: [{ required: true, message: '请选择项目', trigger: 'blur' }],
        pipeline: [
          { required: true, message: '请选择流程', trigger: 'change' },
        ],
        prefix: [
          { required: true, message: '请输入前缀', trigger: 'blur' },
          {
            validator: (
              rule: any,
              value: string,
              callback: (error?: Error) => void,
            ) => {
              if (!value.includes('_')) {
                callback(new Error('至少包含一个下划线`_`'));
              } else {
                callback();
              }
            },
            trigger: 'blur',
          },
        ],
      },
      projects,
      is_opening: false,
    };
  },
  computed: {
    inputPrefix(): HTMLInputElement {
      return (this.$refs.inputPrefix as ElInput).$refs
        .input as HTMLInputElement;
    },
    formComponent(): ElForm {
      return this.$refs.form as ElForm;
    },
  },
  methods: {
    open() {
      this.formComponent.validate((valid: boolean) => {
        if (valid) {
          showFullScreenLoading();
          location.href = buildURL('', this.form);
        }
      });
    },
    pack() {
      this.formComponent.validate((valid: boolean) => {
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
        this.inputPrefix.focus();
        this.inputPrefix.setSelectionRange(
          project.code.length + 3,
          project.code.length + 5,
        );
      });
    },
  },
});
</script>
