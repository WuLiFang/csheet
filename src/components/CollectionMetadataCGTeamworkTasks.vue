<template lang="pug">
  component(:is="tag")
    table(
      class="container text-center overflow-auto max-w-full"
    )
      thead
        tr
          th(rowspan="2") 流程
          th(:colspan="stages.length") 阶段
          th(rowspan="2") 制作者
        tr
          th(
            v-for="i in stages"
            class="cursor-pointer hover:bg-gray-800"
            @click.stop="preferredStage = i"
            :class=`{
              "opacity-75": preferredStage != i,
            }`
          ) {{$t('cgteamwork-stage.' + i)}}
            p.text-xs.text-gray-500(
              v-if="preferredStage == i"
            ) 总览显示
      tbody
        tr(v-for="i in tasks")
          td {{i.pipeline}}
          td(
            v-for="stage in stages"
          )
            CGTeamworkTaskStatus(
              class="inline-block w-full h-full"
              :value="i.status[stage]")
          td
            span.artist.mx-1(v-for="j in i.artists") {{j}}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { uniq, sortBy } from 'lodash';
import db from '@/db';
import CGTeamworkTaskStatus from './CGTeamworkTaskStatus.vue';

@Component<CollectionMetadataCGTeamworkTasks>({
  components: {
    CGTeamworkTaskStatus,
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

  get preferredStage(): string {
    return db.preference.get('cgteamworkStage');
  }

  set preferredStage(v: string) {
    db.preference.set('cgteamworkStage', v);
  }

  get stages(): string[] {
    return sortBy(uniq(this.tasks.flatMap(i => Object.keys(i.status))), [
      i => -['client', 'director', 'leader'].indexOf(i),
    ]);
  }
}
</script>
