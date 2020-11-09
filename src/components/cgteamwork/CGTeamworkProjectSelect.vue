<template lang="pug">
  Select(
    ref="select"
    v-bind="$attrs"
    v-on="$listeners"
    class="w-48"
    v-model="$_value"
    :options="options"
    :query.sync="query"
    search-placeholder="搜索项目"
    required-message="请选择项目"
    dropdown-class="w-64"
    :loading="loadingCount > 0"
  )
    span {{ selected && selected.name }}
    template(#placeholder)
      span.text-gray-500 请选择项目
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import getVModelMixin from '../../mixins/VModelMixinV2';
import {
  cgteamworkProjects,
  cgteamworkProjects_cgteamworkProjects as Project,
  cgteamworkProjectsVariables,
} from '../../graphql/types/cgteamworkProjects';
import { orderBy, uniqBy } from 'lodash';
import Select, { Option } from '@/components/global/Select.vue';

const statusOrder = ['CLOSE', 'APPROVE', 'WORK', 'ACTIVE'];

@Component<CGTeamworkProjectSelect>({
  inheritAttrs: false,
  apollo: {
    matchedProjects: {
      query: require('@/graphql/queries/cgteamworkProjects.gql'),
      variables(): cgteamworkProjectsVariables {
        return {
          q: this.query || undefined,
          status: this.query ? undefined : ['Active'],
        };
      },
      update(v: cgteamworkProjects): Project[] {
        return orderBy(
          v.cgteamworkProjects ?? [],
          [i => statusOrder.indexOf(i.status.toUpperCase()), i => i.name],
          ['desc', 'asc']
        );
      },
    },
    selectedProjects: {
      query: require('@/graphql/queries/cgteamworkProjects.gql'),
      variables(): cgteamworkProjectsVariables {
        return {
          database: [this.$_value],
        };
      },
      update(v: cgteamworkProjects): Project[] {
        return v.cgteamworkProjects ?? [];
      },
      skip(): boolean {
        return !this.$_value;
      },
    },
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
    return orderBy(
      uniqBy(
        [
          ...(this.query ? [] : this.selectedProjects ?? []),
          ...(this.matchedProjects ?? []),
        ],
        i => i.database
      ),
      [i => statusOrder.indexOf(i.status.toUpperCase()), i => i.name],
      ['desc', 'asc']
    );
  }

  get selected(): Project | undefined {
    return this.projects?.find(i => i.database === this.$_value);
  }

  get options(): Option<string>[] {
    return this.projects.map(i => ({
      key: i.database,
      value: i.database,
      render: h => [
        h('div', { staticClass: 'text-xs text-gray-500' }, [
          h('span', {}, i.codename),
          h(
            'span',
            {
              staticClass: 'px-1 rounded-sm text-white float-right',
              class: {
                'bg-blue-600': i.status.toUpperCase() === 'ACTIVE',
                'bg-gray-600': i.status.toUpperCase() === 'CLOSE',
                'bg-green-600': i.status.toUpperCase() === 'APPROVE',
                'bg-purple-600': i.status.toUpperCase() === 'WORK',
              },
            },
            i.status
          ),
        ]),
        h('div', { staticClass: 'text-lg' }, i.name),
      ],
    }));
  }

  focus(): void {
    this.$refs.select?.focus();
  }
}
</script>
