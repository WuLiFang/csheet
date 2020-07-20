<template lang="pug">
  select(
    v-model="$_value"
    v-on="$listeners"
  )
    template(v-for="i in projects")
      option(:value="i.database") {{i.name}}
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { VModelMixin } from '../../mixins/VModelMixin';
import {
  cgteamworkProjects,
  cgteamworkProjects_cgteamworkProjects as Project,
} from '../../graphql/types/cgteamworkProjects';
import { sortBy } from 'lodash';

@Component<CGTeamworkProjectSelect>({
  apollo: {
    projects: {
      query: require('@/graphql/queries/cgteamworkProjects.gql'),
      update(v: cgteamworkProjects): Project[] {
        return sortBy(v.cgteamworkProjects ?? [], [i => i.name]);
      },
    },
  },
})
export default class CGTeamworkProjectSelect extends Mixins(VModelMixin) {
  projects!: Project[];
}
</script>
