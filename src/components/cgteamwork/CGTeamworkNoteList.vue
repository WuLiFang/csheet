<template lang="pug">
  .cgteamwork-note-list(open)
    .flex.items-center
      span 备注
      button.form-button(
        type="button"
        title="添加备注"
        class="p-0 w-12 h-6 m-1"
        class="inline-flex flex-center"
        @click="showFormDrawer()"
      )
        FaIcon(name="plus")
      span.mx-1.text-gray-600
        span 于
        TimeWidget.mx-1(:value="fetched" format="HH:mm:ss")
        span 查询
      span.mx-1.text-gray-600.inline-flex.items-center 每 10 秒自动刷新
    template(v-if="loadingCount > 0 ")
      FaIcon(name="spinner" spin class="w-full inline-block h-8 text-gray-500")
    template(v-else-if="values.length === 0")
      p.text-gray-600.text-center 无备注
    template(v-else)
      ol(
        class="ml-2 space-y-1"
      )
        template(v-for="i in values")
          CGTeamworkNoteListItem(:value="i" :hide-pipeline="pipelines.length === 1")
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import CGTeamworkNoteListItem, {
  CGTeamworkNoteListItemValue,
} from './CGTeamworkNoteListItem.vue';
import {
  collectionNodeVariables,
  collectionNode,
} from '@/graphql/types/collectionNode';
import {
  collectionCGTeamworkNotesVariables,
  collectionCGTeamworkNotes,
} from '@/graphql/types/collectionCGTeamworkNotes';
import { filePathFormat } from '@/const';
import { collection as Collection } from '@/graphql/types/collection';
import cast from 'cast-unknown';
import { orderBy } from 'lodash';
import 'vue-awesome/icons/sync';
import 'vue-awesome/icons/plus';
import { show } from '@/modal';
import CGTeamworkNoteFormDrawer from '@/components/cgteamwork/CGTeamworkNoteFormDrawer.vue';

@Component<CGTeamworkNoteList>({
  components: {
    CGTeamworkNoteListItem,
  },
  apollo: {
    node: {
      query: require('@/graphql/queries/collectionNode.gql'),
      variables(): collectionNodeVariables {
        return { id: this.id, filePathFormat };
      },
      update(v: collectionNode): Collection | undefined {
        return v.node?.__typename === 'Collection' ? v.node : undefined;
      },
    },
    values: {
      query: require('@/graphql/queries/collectionCGTeamworkNotes.gql'),
      variables(): collectionCGTeamworkNotesVariables {
        return { id: this.id };
      },
      update(v: collectionCGTeamworkNotes): CGTeamworkNoteListItemValue[] {
        return orderBy(
          (v.node?.__typename === 'Collection'
            ? v.node.cgteamworkNotes ?? []
            : []
          ).flatMap(i =>
            i.notes.map(j => ({
              ...j,
              pipeline: i.pipeline,
              created: cast.date(j.created),
            }))
          ),
          i => i.created,
          'desc'
        );
      },
      result() {
        this.fetched = new Date();
      },
      fetchPolicy: 'cache-and-network',
      pollInterval: 10e3,
    },
  },
})
export default class CGTeamworkNoteList extends Vue {
  @Prop({ type: String, required: true })
  id!: string; // Colleciton id.

  node?: Collection;
  values: CGTeamworkNoteListItemValue[] = [];

  loadingCount = 0;

  fetched = new Date(0);

  get pipelines(): string[] {
    return cast
      .array(
        JSON.parse(
          this.node?.metadata.find(i => i.k === 'cgteamwork.tasks')?.v ?? ''
        )
      )
      .map(i => cast.string(i.pipeline));
  }

  async refetch(): Promise<void> {
    await this.$apollo.queries.values.refetch();
  }

  showFormDrawer(): void {
    show(CGTeamworkNoteFormDrawer, {
      attrs: { id: this.id },
      on: {
        submit: () => {
          this.refetch();
        },
      },
    });
  }
}
</script>
