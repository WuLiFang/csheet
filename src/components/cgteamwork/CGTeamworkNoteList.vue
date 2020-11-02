<template lang="pug">
  .cgteamwork-note-list(open)
    .flex.items-center
      span 备注
      button.form-button(
        class="inline-flex flex-center"
        class="h-6 py-0 px-2 mx-1"
        type="button"
        @click="refetch()"
      )
        FaIcon(name="sync" class="mx-1")
        span 刷新
    ol(
      class="ml-2 space-y-1"
    )
      template(v-for="i in values")
        CGTeamworkNoteListItem(:value="i" :hide-pipeline="pipelines.length === 1")
    template(v-if="values.length === 0")
      p.text-gray-600.text-center 无备注
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import CGTeamworkNoteListItem, {CGTeamworkNoteListItemValue} from './CGTeamworkNoteListItem.vue';
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
import "vue-awesome/icons/sync"

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
        return {
          id: this.id,
          pipeline: this.formData.pipeline
            ? [this.formData.pipeline]
            : undefined,
        };
      },
      update(v: collectionCGTeamworkNotes): CGTeamworkNoteListItemValue[] {
        return orderBy(
          ( v.node?.__typename === 'Collection'
          ? v.node.cgteamworkNotes ?? []
          : []).flatMap(i => i.notes.map(j => ({
            ...j,
            pipeline: i.pipeline,
            created: cast.date(j.created),
          }))),
          i => i.created,
          "desc"
        );
      },
      fetchPolicy: "cache-and-network",
    },
  },
})
export default class CGTeamworkNoteList extends Vue {
  @Prop({ type: String, required: true })
  id!: string; // Colleciton id.

  node?: Collection;
  values?: CGTeamworkNoteListItemValue[];

  formData = {
    pipeline: '',
  };

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
    await this.$apollo.queries.values.refetch()
  }
}
</script>
