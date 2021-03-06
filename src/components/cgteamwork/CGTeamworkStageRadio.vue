<template lang="pug">
  Select(
    v-model="$_value"
    :options="options"
    v-bind="$attrs"
    :loading="loadingCount > 0"
  )
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import getVModelMixin from '@/mixins/VModelMixinV2';
import { Entry } from '@/components/global/entry';
import {
  cgteamworkFlowsVariables,
  CGTeamworkFlow,
} from '@/graphql/queries/cgteamworkFlows';
import { unionBy } from 'lodash';
import queries from '@/graphql/queries';

@Component<CGTeamworkStageRadio>({
  inheritAttrs: false,
  apollo: {
    cgteamworkFlows: queries.vue.cgteamworkFlows<CGTeamworkStageRadio>({
      variables() {
        return this.variables;
      },
      skip() {
        if (this.variables.pipeline?.length === 0) {
          return true;
        }
        return false;
      },
    }),
  },
  mounted() {
    this.$watch(
      () => ({
        options: this.options,
        value: this.value,
      }),
      ({ options, value }) => {
        if (!options.some(i => i.value === value)) {
          const labelMatch = options.find(i => i.label === value);
          if (labelMatch) {
            this.$_value = labelMatch.value;
          }
        }
      }
    );
  },
})
export default class CGTeamworkStageRadio extends Mixins(
  getVModelMixin<string>()
) {
  @Prop({ type: Object, required: true })
  variables!: cgteamworkFlowsVariables;

  cgteamworkFlows?: CGTeamworkFlow[];

  loadingCount = 0;

  get options(): Entry<string>[] {
    return unionBy(
      this.cgteamworkFlows?.flatMap(i => i.stages) ?? [],
      i => i.id
    ).map(i => ({
      key: i.id,
      value: i.id,
      label: i.name,
    }));
  }
}
</script>
