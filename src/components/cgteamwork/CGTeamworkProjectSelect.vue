<template lang="pug">
  select(
    v-model="$_value"
  )
    template(v-for="i in projects")
      option(:value="i.database") {{i.name}}
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator';
import { VModelMixin } from '../../mixins/VModelMixin';
import {
  cgteamworkProjects,
  cgteamworkProjects_cgteamworkProjects as Project,
} from '../../graphql/types/cgteamworkProjects';

@Component<CGTeamworkProjectSelect>({
  apollo: {
    projects: {
      query: require('@/graphql/queries/cgteamworkProjects.gql'),
      update(v: cgteamworkProjects): Project[] {
        return v.cgteamworkProjects ?? [];
      },
    },
  },
})
export default class CGTeamworkProjectSelect extends Mixins(VModelMixin) {
  projects!: Project[];
}
</script>
