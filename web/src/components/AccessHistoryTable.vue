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
        a(@click='showFullScreenLoading' :href='row.page.href') {{ getDescription(row) }}
    ElTableColumn(
      label='条目'
      prop='page.counts.item'
    )
    ElTableColumn(
      label='图片'
      prop='page.counts.image'
    )
    ElTableColumn(
      label='视频'
      prop='page.counts.video'
    )
    ElTableColumn(
      min-width='80'
    )
      template(#default='{row}')
        i.el-icon-close.remove(
          @click='remove(row)'
          size='mini'
        )
</template>

<script lang="ts">
import * as accessHistory from '@/access-history';
import { showFullScreenLoading } from '@/index';
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
  public showFullScreenLoading = showFullScreenLoading;

  public async mounted() {
    await this.updateData();
  }
  public async updateData() {
    await accessHistory.prune();
    this.tableData = await accessHistory.getAll();
  }
  public async remove(v: accessHistory.IPageHistory) {
    await accessHistory.remove(v);
    await this.updateData();
  }
  public getDescription({ page }: accessHistory.IPageHistory): string {
    let params: URLSearchParams;
    try {
      params = new URL(page.href).searchParams;
    } catch {
      return page.href;
    }
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
