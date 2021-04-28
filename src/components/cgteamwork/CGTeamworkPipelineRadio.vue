<template lang="pug">
  Select(
    ref="select"
    v-bind="$attrs"
    v-on="$listeners"
    class="w-48"
    v-model="$_value"
    :options="options"
    required-message="请选择流程"
    dropdown-class="w-64"
    :loading="loadingCount > 0"
    @focus="() => $refs.queryInput.focus()"
  )
    template(#default="{ value, location }")
      Variable(
        :pipeline="getPipeline(value)"
        v-slot="{ pipeline }"
      )
        template(v-if="pipeline")
          p {{ pipeline.name }}
          p(
            v-if="location !== 'output' && pipeline.description !== pipeline.name"
            class="text-xs text-gray-500"
          ) {{ pipeline.description }}
        template(v-else-if="loadingCount > 0")
          svg(
            class="fill-current inline-block w-full h-6 animate-spin"
            viewBox="0 0 24 24"
          )
            path(:d="mdiLoading")
        template(v-else)
          p {{ value }}
    template(#placeholder)
      span.text-gray-500 请选择流程
    template(#search="{ inputListeners }")
      .flex.items-center
        LocalStorage(name="cgteamwork.module" v-model="module")
          Radio(
            tabindex="-1"
            class="flex-none"
            v-model="module",
            :options=`[
              { key: 'shot', value: "shot", label: "镜头" },
              { key: 'asset', value: "asset", label: "资产" },
            ]`
            label-class="text-sm block"
            v-on="inputListeners"
          )
        input.form-input(
          v-model="query"
          v-on="inputListeners"
          class="flex-auto w-16"
          ref="queryInput"
          placeholder="搜索流程"
        )
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
import Select from '@/components/global/Select.vue';
import { mdiLoading } from '@mdi/js';

// TODO: rename this to `CGTeamworkPipelineSelect`

@Component<CGTeamworkPipelineRadio>({
  inheritAttrs: false,
  data() {
    return { mdiLoading };
  },
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
export default class CGTeamworkPipelineRadio extends Mixins(
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
      [(i) => i.order, (i) => i.name],
      ['desc', 'asc']
    );
  }

  getPipeline(name: string): Pipeline | undefined {
    return this.pipelines.find((i) => i.name === name);
  }

  get options(): string[] {
    return this.pipelines.map((i) => i.name);
  }

  focus(): void {
    this.$refs.select?.focus();
  }
}
</script>
