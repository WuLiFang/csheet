<template lang="pug">
  Select(
    v-bind="$attrs"
    v-on="$listeners"
    class="w-48"
    v-model="$_value"
    :options="options"
    :query.sync="query"
    search-placeholder="搜索流程"
    required-message="请选择流程"
    dropdown-class="w-48"
    :loading="loadingCount > 0"
  )
    template(#placeholder)
      span.text-gray-500 请选择流程
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import getVModelMixin from '../../mixins/VModelMixinV2';
import {
  cgteamworkPipelines,
  cgteamworkPipelines_cgteamworkPipelines as Pipeline,
  cgteamworkPipelinesVariables,
} from '../../graphql/types/cgteamworkPipelines';
import { uniqBy, sortBy } from 'lodash';
import CGTeamworkPipelineSelectOption from './CGTeamworkPipelineSelectOption.vue';
import { Option } from '@/components/global/Select.vue';

@Component<CGTeamworkPipelineSelect>({
  inheritAttrs: false,
  components: {
    CGTeamworkPipelineSelectOption,
  },
  apollo: {
    matchedpipelines: {
      query: require('@/graphql/queries/cgteamworkPipelines.gql'),
      variables(): cgteamworkPipelinesVariables {
        return {
          q: this.query || undefined,
          database: this.database,
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
    queryInput: HTMLInputElement;
    validationInput: HTMLInputElement;
    option: HTMLDivElement[];
  };

  query = '';
  loadingCount = 0;

  matchedpipelines?: Pipeline[];
  selectedpipelines?: Pipeline[];

  get pipelines(): Pipeline[] {
    return sortBy(
      uniqBy(
        [
          ...(this.matchedpipelines ?? []),
          ...(this.query
            ? []
            : this.$_value
            ? [
                {
                  __typename: 'CGTeamworkPipeline',
                  name: this.$_value,
                  description: '',
                  order: '',
                } as Pipeline,
              ]
            : []),
        ],
        i => i.name
      ),
      [i => i.order, i => i.name]
    );
  }

  get options(): Option<string>[] {
    return this.pipelines.map(i => ({
      key: i.name,
      value: i.name,
      render: h => h(CGTeamworkPipelineSelectOption, { props: { value: i } }),
    }));
  }
}
</script>
