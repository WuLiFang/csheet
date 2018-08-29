<template lang="pug">
  #the-index
    h1 色板工具{{version}}
    #tabs
      ElTabs
        ElTabPane(label='CGTeamWork')
          CGTeamWorkPageForm
        ElTabPane(label='文件夹')
          LocalPageForm
    footer &copy; 北京吾立方数码科技有限公司 2018
</template>
<script lang="ts">
import Vue from 'vue';
import Cookies from 'js-cookie';
import CGTeamWorkPageForm from './CGTeamWorkPageForm.vue';
import LocalPageForm from './LocalPageForm.vue';
import { version } from '@/index';
import {
  Tag as ElTag,
  Input as ElInput,
  Button as ElButton,
  Dialog as ElDialog,
  Radio as ElRadio,
  Select as ElSelect,
  Form as ElForm,
  FormItem as ElFormItem,
  Tabs as ElTabs,
  TabPane as ElTabPane,
  Message,
  Notification,
} from 'element-ui';
export default Vue.extend({
  components: {
    ElTabs,
    ElTabPane,
    CGTeamWorkPageForm,
    LocalPageForm,
  },
  data() {
    return {
      version,
    };
  },
});
</script>
<style lang="scss" scoped>
#the-index {
  max-width: 800px;
  margin: auto;
}
h1 {
  font-weight: normal;
}
footer {
  text-align: right;
}
</style>
