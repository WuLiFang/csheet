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
            template(v-if="stage in i.status")
              CGTeamworkStatusWidget(
                class="inline-block w-full h-full"
                :value="i.status[stage]"
              )
            svg.fill-current.text-white(
              class="hidden group-hover:block absolute h-full top-0 right-0 p-1"
              viewBox="0 0 24 24"
            )
              path(:d="mdiSquareEditOutline")
          td
            span.artist.mx-1(v-for="j in i.artists") {{j}}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { uniq, sortBy, uniqBy } from 'lodash';
import CGTeamworkStatusWidget from './cgteamwork/CGTeamworkStatusWidget.vue';
import { show } from '@/modal';
import CGTeamworkFlowFormDrawer from './cgteamwork/CGTeamworkFlowFormDrawer.vue';
import { CGTeamworkOriginPrefix } from '@/client/origin-prefix';
import queries from '@/graphql/queries';
import { Collection } from '@/graphql/queries/collectionNode';
import { CGTeamworkFlow } from '@/graphql/queries/cgteamworkFlows';
import { mdiSquareEditOutline } from '@mdi/js';

@Component<CollectionMetadataCGTeamworkTasks>({
  apollo: {
    flows: queries.vue.cgteamworkFlows<CollectionMetadataCGTeamworkTasks>({
      variables() {
        return {
          database: CGTeamworkOriginPrefix.parse(this.collection?.origin ?? '')
            .database,
          pipeline: uniqBy(
            this.tasks.map((i) => i.pipeline),
            (i) => i
          ),
        };
      },
      skip() {
        return !this.collection;
      },
    }),
    collection: queries.vue.collectionNode<CollectionMetadataCGTeamworkTasks>({
      variables() {
        return { id: this.id ?? '' };
      },
      skip() {
        return !this.id;
      },
    }),
  },
  components: {
    CGTeamworkStatusWidget,
  },
  data() {
    return { mdiSquareEditOutline };
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
      ...(this.flows?.flatMap((i) => i.stages.map((i) => i.name)) ?? []),
      ...this.tasks.flatMap((i) => Object.keys(i.status)),
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
