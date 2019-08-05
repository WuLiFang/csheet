<template lang="pug">
  #the-index
    h1 色板工具 {{VERSION}}
    AccessHistoryTable
    #tabs
      ElTabs
        ElTabPane(label='CGTeamWork' v-if='projects.length')
          CGTeamWorkPageForm
        ElTabPane(label='文件夹')
          LocalPageForm
    footer &copy; 北京吾立方数码科技有限公司 2018-2019
</template>
<script lang="ts">
import { projects } from '@/index';
import Vue from 'vue';

import AccessHistoryTable from '@/components/AccessHistoryTable.vue';
import CGTeamWorkPageForm from '@/components/CGTeamWorkPageForm.vue';
import LocalPageForm from '@/components/LocalPageForm.vue';
import {
  Button as ElButton,
  Table as ElTable,
  TableColumn as ElTableColumn,
  TabPane as ElTabPane,
  Tabs as ElTabs,
} from 'element-ui';

export default Vue.extend({
  components: {
    AccessHistoryTable,
    CGTeamWorkPageForm,
    ElButton,
    ElTabPane,
    ElTable,
    ElTableColumn,
    ElTabs,
    LocalPageForm,
  },
  data() {
    return {
      VERSION,
      projects,
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
