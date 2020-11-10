<template lang="pug">
  .inline-flex.items-center
    LocalStorage(name="cgteamwork.module" v-model="module")
      RadioOrSelect(
        v-model="module",
        :options=`[
          { value: "shot", label: "镜头" },
          { value: "asset", label: "资产" },
        ]`
        class=""
        radio-label-class="text-sm block"
      )
    Select(
      ref="select"
      v-bind="$attrs"
      v-on="$listeners"
      class="w-48"
      v-model="$_value"
      :options="options"
      :query.sync="query"
      search-placeholder="搜索流程"
      required-message="请选择流程"
      dropdown-class="w-64"
      :loading="loadingCount > 0"
    )
      template(#placeholder)
        span.text-gray-500 请选择流程
      template(#before-options)
        .stikcy.top-0
          button.form-button(
            type="button"
          ) 镜头
          button.form-button(
            type="button"
          ) 资产
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import getVModelMixin from '../../mixins/VModelMixinV2';
import {
  cgteamworkPipelines,
  cgteamworkPipelines_cgteamworkPipelines as Pipeline,
  cgteamworkPipelinesVariables,
} from '../../graphql/types/cgteamworkPipelines';
import { orderBy } from 'lodash';
import Select, { Option } from '@/components/global/Select.vue';

@Component<CGTeamworkPipelineSelect>({
  inheritAttrs: false,
  apollo: {
    matchedPipelines: {
      query: require('@/graphql/queries/cgteamworkPipelines.gql'),
      variables(): cgteamworkPipelinesVariables {
        return {
          q: this.query || undefined,
          database: this.database,
          module: this.module ? [this.module] : undefined,
        };
      },
      update(v: cgteamworkPipelines): Pipeline[] {
        return v.cgteamworkPipelines ?? [];
      },
      skip(): boolean {
        return !this.database;
      },
    },
  },
})
export default class CGTeamworkPipelineSelect extends Mixins(
  getVModelMixin<string>()
) {
  @Prop({ type: String, required: true })
  database!: string;

  $el!: HTMLDivElement;

  $refs!: {
    select: Select;
  };

  query = '';
  loadingCount = 0;
  matchedPipelines?: Pipeline[];
  module = 'shot';

  get pipelines(): Pipeline[] {
    return orderBy(
      this.matchedPipelines ?? [],
      [i => i.order, i => i.name],
      ['desc', 'asc']
    );
  }

  get options(): Option<string>[] {
    return this.pipelines.map(i => ({
      key: i.name,
      value: i.name,
      render: h => [
        ...(i.description !== i.name
          ? [h('div', { staticClass: 'text-xs text-gray-500' }, i.description)]
          : []),
        h('div', { staticClass: 'text-lg' }, i.name),
      ],
    }));
  }

  focus(): void {
    this.$refs.select?.focus();
  }
}
</script>
