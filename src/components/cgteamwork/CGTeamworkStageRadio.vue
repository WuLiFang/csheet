<template lang="pug">
  Select(
    v-model="$_value"
    :options="options"
    v-bind="$attrs"
  )
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import getVModelMixin from '@/mixins/VModelMixinV2';
import { Entry } from '@/components/global/entry';
import cgteamworkFlowsQuery, {
  cgteamworkFlowsVariables,
  CGTeamworkFlow,
} from '@/graphql/queries/cgteamworkFlows';
import { unionBy } from 'lodash';

@Component<CGTeamworkStageRadio>({
  inheritAttrs: false,
  apollo: {
    cgteamworkFlows: cgteamworkFlowsQuery<CGTeamworkStageRadio>({
      variables() {
        return this.variables;
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
