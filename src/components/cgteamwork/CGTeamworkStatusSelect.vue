<template lang="pug">
  Select(
    ref="select"
    v-model="$_value"
    :options="options"
    :loading="loadingCount > 0"
    v-bind="$attrs"
  )
    template(#default="{ value }")
      CGTeamworkTaskStatus.inline-block(
        class="w-full text-center"
        :value="value"
      )
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import getVModelMixin from '@/mixins/VModelMixinV2';
import cgteamworkFlowsQuery, {
  cgteamworkFlowsVariables,
  CGTeamworkFlow,
} from '@/graphql/queries/cgteamworkFlows';
import { unionBy } from 'lodash';
import CGTeamworkTaskStatus from '@/components/cgteamwork/CGTeamworkTaskStatus.vue';
import cgteamworkStatusesQuery, {
  CGTeamworkStatus,
} from '@/graphql/queries/cgteamworkStatuses';
import Select from '@/components/global/Select.vue';

@Component<CGTeamworkStatusSelect>({
  inheritAttrs: false,
  components: {
    CGTeamworkTaskStatus,
  },
  apollo: {
    cgteamworkFlows: cgteamworkFlowsQuery<CGTeamworkStatusSelect>({
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

    statuses: cgteamworkStatusesQuery({}),
  },
})
export default class CGTeamworkStatusSelect extends Mixins(
  getVModelMixin<string>()
) {
  @Prop({ type: Object, required: true })
  variables!: cgteamworkFlowsVariables;

  @Prop({ type: String })
  stage?: string;

  $refs!: {
    select: Select;
  };

  cgteamworkFlows?: CGTeamworkFlow[];
  statuses?: CGTeamworkStatus[];

  loadingCount = 0;

  get options(): string[] {
    return unionBy(
      this.cgteamworkFlows
        ?.flatMap(i => i.stages)
        .filter(i => {
          if (this.stage && i.id !== this.stage) {
            return false;
          }
          return true;
        })
        .flatMap(i => i.statuses) ?? [],
      i => i.id
    ).map(i => i.id);
  }

  focus(): void {
    this.$refs.select.focus();
  }
}
</script>
