<template lang="pug">
  Select(
    ref="select"
    v-bind="$attrs"
    v-on="$listeners"
    class="w-48"
    v-model="$_value"
    :options="options"
    required-message="请选择项目"
    dropdown-class="w-64"
    :loading="loadingCount > 0"
    @focus="() => $refs.queryInput.focus()"
  )
    template(#default="{ value, location }")
      Variable(
        :project="getProject(value)"
        v-slot="{ project }"
      )
        template(v-if="project")
          p.text-xs.text-gray-500(
            v-if="location !== 'output'"
          )
            span {{ project.codename }}
            span(
              class="px-1 rounded-sm text-white float-right"
              :class="statusClass(project.status)"
            ) {{ project.status }}
          p {{ project.name }}
        template(v-else-if="loadingCount > 0")
          FaIcon(
            class="text-center w-full"
            name="spinner" spin
          )
        template(v-else)
          p {{ value }}
    template(#search="{ inputListeners }")
      input.form-input(
        ref="queryInput"
        v-model="query"
        v-on="inputListeners"
        class="w-full"
        placeholder="搜索项目"
      )
    template(#placeholder)
      span.text-gray-500 请选择项目
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import getVModelMixin from '../../mixins/VModelMixinV2';
import {
  cgteamworkProjects_cgteamworkProjects as Project,
} from '../../graphql/types/cgteamworkProjects';
import { orderBy } from 'lodash';
import Select from '@/components/global/Select.vue';
import cgteamworkProjectsQuery from '@/graphql/queries/cgteamworkProjects';

const statusOrder = ['CLOSE', 'APPROVE', 'WORK', 'ACTIVE'];

@Component<CGTeamworkProjectSelect>({
  inheritAttrs: false,
  apollo: {
    matchedProjects: cgteamworkProjectsQuery<CGTeamworkProjectSelect>({
      variables() {
        return {
          q: this.query || undefined,
          status: this.query ? undefined : ['Active'],
        };
      },
    }),
    selectedProjects: cgteamworkProjectsQuery<CGTeamworkProjectSelect>({
      variables() {
        return {
          database: [this.$_value],
        };
      },
      skip(): boolean {
        return !this.$_value;
      },
    }),
  },
})
export default class CGTeamworkProjectSelect extends Mixins(
  getVModelMixin<string>()
) {
  $el!: HTMLDivElement;

  $refs!: {
    select: Select;
  };

  query = '';
  loadingCount = 0;

  matchedProjects?: Project[];
  selectedProjects?: Project[];

  get projects(): Project[] {
    return [...(this.matchedProjects ?? []), ...(this.selectedProjects ?? [])];
  }

  get options(): string[] {
    return orderBy(
      this.matchedProjects ?? [],
      [i => statusOrder.indexOf(i.status.toUpperCase()), i => i.name],
      ['desc', 'asc']
    ).map(i => i.database);
  }

  focus(): void {
    this.$refs.select?.focus();
  }

  protected getProject(database: string): Project | undefined {
    return this.projects.find(i => i.database === database);
  }

  protected statusClass(v: string): string {
    switch (v.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-blue-600';
      case 'CLOSE':
        return 'bg-gray-600';
      case 'APPROVE':
        return 'bg-green-600';
      case 'WORK':
        return 'bg-purple-600';
      default:
        return '';
    }
  }
}
</script>
