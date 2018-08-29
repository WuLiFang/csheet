<template lang="pug">
  ElForm(
    label-width='80px' 
    v-loading.fullscreen='is_opening' 
    element-loading-text='正在生成'
    element-loading-background="rgba(0, 0, 0, 0.8)"
  )
    ElFormItem(label='项目')
      ElSelect(v-model='form.project' @change='setDefaultPrefix')
        ElOption(v-for='i in projects' :key='i.code', :value='i.name')
    ElFormItem(label='流程')
      ElRadio(v-model='form.pipeline' label='合成')
      ElRadio(v-model='form.pipeline' label='灯光')
      ElRadio(v-model='form.pipeline' label='动画')
    ElFormItem(label='前缀')
      ElInput(v-model='form.prefix' ref='inputPrefix')
    ElFormItem
      ElButton(type='primary' @click='open' :disabled='is_opening') 打开

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
import { projects } from '@/index';
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
      projects,
      is_opening: false,
    };
  },
  computed: {
    inputPrefix(): HTMLInputElement {
      return (this.$refs.inputPrefix as ElInput).$refs
        .input as HTMLInputElement;
    },
  },
  methods: {
    open() {
      this.is_opening = true;
      location.href = buildURL('', this.form);
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
