<template lang="pug">
  component(:is="tag")
    table(
      class="container text-center overflow-auto max-w-full"
    )
      thead
        tr
          th(rowspan="2") 流程
          th(:colspan="stages.length") 状态
          th(rowspan="2") 制作者
        tr
          th(
            v-for="i in stages"
            class="text-gray-500"
          ) {{ $te(`cgteamwork-stage.${i}`) ? $t(`cgteamwork-stage.${i}`) : i }}
      tbody
        tr(v-for="i in tasks")
          td {{i.pipeline}}
          td(
            v-for="stage in stages"
            class="cursor-pointer hover:bg-gray-800 group relative"
            @click="showFlowDrawer(stage, i.pipeline)"
          )
            CGTeamworkTaskStatus(
              class="inline-block w-full h-full"
              :value="i.status[stage]")
            FaIcon(
              class="hidden group-hover:block absolute object-contain h-full top-0 right-0 p-1"
              name="edit"
            )
          td
            span.artist.mx-1(v-for="j in i.artists") {{j}}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { uniq, sortBy, uniqBy } from 'lodash';
import CGTeamworkTaskStatus from './cgteamwork/CGTeamworkTaskStatus.vue';
import { show } from '@/modal';
import CGTeamworkFlowFormDrawer from './cgteamwork/CGTeamworkFlowFormDrawer.vue';
import 'vue-awesome/icons/edit';
import cgteamworkFlowsQuery, {
  CGTeamworkFlow,
} from '@/graphql/queries/cgteamworkFlows';
import collectionNodeQuery, {
  Collection,
} from '@/graphql/queries/collectionNode';
import { CGTeamworkOriginPrefix } from '@/client';

@Component<CollectionMetadataCGTeamworkTasks>({
  apollo: {
    flows: cgteamworkFlowsQuery<CollectionMetadataCGTeamworkTasks>({
      variables() {
        return {
          database: CGTeamworkOriginPrefix.parse(this.collection?.origin ?? '')
            .database,
          pipeline: uniqBy(
            this.tasks.map(i => i.pipeline),
            i => i
          ),
        };
      },
      skip() {
        return !this.collection;
      },
    }),
    collection: collectionNodeQuery<CollectionMetadataCGTeamworkTasks>({
      variables() {
        return { id: this.id ?? '' };
      },
      skip() {
        return !this.id;
      },
    }),
  },
  components: {
    CGTeamworkTaskStatus,
  },
})
export default class CollectionMetadataCGTeamworkTasks extends Vue {
  @Prop({ type: String })
  id?: string;

  @Prop({ type: String, required: true })
  value!: string;

  @Prop({ type: String, default: 'div' })
  tag!: string;

  collection?: Collection;
  flows?: CGTeamworkFlow[];

  get tasks(): {
    artists: string[];
    id: string;
    pipeline: string;
    status: Record<string, string>;
  }[] {
    return sortBy(JSON.parse(this.value), 'pipeline');
  }

  get stages(): string[] {
    return uniq([
      ...(this.flows?.flatMap(i => i.stages.map(i => i.name)) ?? []),
      ...this.tasks.flatMap(i => Object.keys(i.status)),
    ]);
  }

  showFlowDrawer(stage?: string, pipeline?: string): void {
    if (!this.id) {
      return;
    }
    show(CGTeamworkFlowFormDrawer, {
      attrs: {
        id: this.id,
        default: {
          stage,
          pipeline,
        },
      },
    });
  }
}
</script>
