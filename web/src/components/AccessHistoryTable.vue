<template lang="pug">
  ElTable.access-history-table(
    v-show='tableData.length > 0'
    :data='tableData'
  )
    ElTableColumn(
      label='最近访问'
      prop='atime'
      min-width='80'
    )
      template(#default='{ row }')
        TimeWidget(v-model='row.atime')
    ElTableColumn(
      label='描述'
      prop='page.href'
      min-width='200'
    )
      template(#default='{ row }')
        a(@click='location.assign(row.page.href)') {{ getDescription(row) }}
    ElTableColumn(
      min-width='80'
    )
      template(#default='{row}')
        i.el-icon-close.remove(
          @click='remove(row.page.href)'
          size='mini'
        )
</template>

<script lang="ts">
import * as accessHistory from '@/access-history';
import { Component, Vue } from 'vue-property-decorator';

import TimeWidget from '@/components/TimeWidget.vue';
import { Button, Table, TableColumn } from 'element-ui';

@Component<AccessHistoryTable>({
  components: {
    ElButton: Button,
    ElTable: Table,
    ElTableColumn: TableColumn,
    TimeWidget,
  },
})
export default class AccessHistoryTable extends Vue {
  public tableData: accessHistory.IPageHistory[] = [];
  public location = location;
  public async mounted() {
    await this.updateData();
  }
  public async updateData() {
    await accessHistory.prune();
    this.tableData = await accessHistory.getAll();
  }
  public async remove(href: string) {
    await accessHistory.remove(href);
    await this.updateData();
  }
  public getDescription({ page }: accessHistory.IPageHistory): string {
    const params = new URL(location.origin + page.href).searchParams;
    switch (page.type) {
      case 'cgteamwork':
        return `${params.get('project')}-${params.get('pipeline')}-${params.get(
          'prefix'
        )}`;
      case 'local':
        return `${params.get('root')}`;
    }
  }
}
</script>

<style lang="scss" scoped>
a {
  text-decoration: underline;
  cursor: pointer;
}
.remove {
  cursor: pointer;
}
</style>
