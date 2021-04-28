<template lang="pug">
  Select(
    ref="select"
    v-bind="$attrs"
    v-on="$listeners"
    class="w-48"
    :value="value"
    :options="options"
    required-message="请选择项目"
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
            CGTeamworkStatusWidget(
              class="px-1 rounded-sm text-white float-right"
              :class="statusClass(project.status)"
              :value="project.status"
            )
          p {{ project.name }}
        template(v-else-if="loadingCount > 0")
          svg(
            class="fill-current inline-block w-full h-6 animate-spin"
            viewBox="0 0 24 24"
          )
            path(:d="mdiLoading")
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
import CGTeamworkStatusWidget from '@/components/cgteamwork/CGTeamworkStatusWidget.vue';
import Select from '@/components/global/Select.vue';
import queries from '@/graphql/queries';
import { CGTeamworkProject } from '@/graphql/queries/cgteamworkProjects';
import { orderBy } from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mdiLoading } from '@mdi/js';

const statusOrder = ['CLOSE', 'APPROVE', 'WORK', 'ACTIVE'];

@Component<CGTeamworkProjectSelect>({
  inheritAttrs: false,
  data() {
    return { mdiLoading };
  },
  components: {
    CGTeamworkStatusWidget,
  },
  apollo: {
    matchedProjects: queries.vue.cgteamworkProjects<CGTeamworkProjectSelect>({
      variables() {
        return {
          q: this.query || undefined,
          status: this.query ? undefined : ['Active'],
        };
      },
    }),
    selectedProjects: queries.vue.cgteamworkProjects<CGTeamworkProjectSelect>({
      variables() {
        return {
          database: [this.value],
        };
      },
      skip(): boolean {
        return !this.value;
      },
    }),
  },
  mounted() {
    this.$watch(
      () => this.getProject(this.value),
      (v) => {
        this.$emit('update:project', v);
      },
      { immediate: true }
    );
  },
})
export default class CGTeamworkProjectSelect extends Vue {
  @Prop()
  value!: string;

  $el!: HTMLDivElement;

  $refs!: {
    select: Select;
  };

  query = '';
  loadingCount = 0;

  matchedProjects?: CGTeamworkProject[];
  selectedProjects?: CGTeamworkProject[];

  get projects(): CGTeamworkProject[] {
    return [...(this.matchedProjects ?? []), ...(this.selectedProjects ?? [])];
  }

  get options(): string[] {
    return orderBy(
      this.matchedProjects ?? [],
      [(i) => statusOrder.indexOf(i.status.toUpperCase()), (i) => i.name],
      ['desc', 'asc']
    ).map((i) => i.database);
  }

  focus(): void {
    this.$refs.select?.focus();
  }

  protected getProject(database: string): CGTeamworkProject | undefined {
    return this.projects.find((i) => i.database === database);
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
