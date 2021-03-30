<template>
  <component :is="tag">
    <table class="container text-center overflow-auto max-w-full">
      <thead>
        <tr>
          <th rowspan="2">流程</th>
          <th :colspan="stages.length">状态</th>
          <th rowspan="2">制作者</th>
        </tr>
        <tr>
          <th v-for="i in stages" :key="i" class="text-gray-500">
            {{ $te(`cgteamwork-stage.${i}`) ? $t(`cgteamwork-stage.${i}`) : i }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(i, index) in tasks" :key="index">
          <td>{{ i.pipeline }}</td>
          <td
            v-for="stage in stages"
            :key="stage"
            class="cursor-pointer hover:bg-gray-800 group relative"
          >
            <template v-if="stage in i.status">
              <CGTeamworkStatusWidget
                class="inline-block w-full h-full"
                :value="i.status[stage]"
              ></CGTeamworkStatusWidget>
            </template>
          </td>
          <td>
            <span v-for="j in i.artists" :key="j" class="artist mx-1">{{
              j
            }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </component>
</template>

<script lang="ts">
import { sortBy, uniq } from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import CGTeamworkStatusWidget from './cgteamwork/CGTeamworkStatusWidget.static.vue';

@Component<CollectionMetadataCGTeamworkTasks>({
  components: {
    CGTeamworkStatusWidget,
  },
})
export default class CollectionMetadataCGTeamworkTasks extends Vue {
  @Prop({ type: String, required: true })
  value!: string;

  @Prop({ type: String, default: 'div' })
  tag!: string;

  get tasks(): {
    artists: string[];
    id: string;
    pipeline: string;
    status: Record<string, string>;
  }[] {
    return sortBy(JSON.parse(this.value), 'pipeline');
  }

  get stages(): string[] {
    return uniq([...this.tasks.flatMap((i) => Object.keys(i.status))]);
  }
}
</script>
