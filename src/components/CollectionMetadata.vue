<template lang="pug">
  dl
    dt 收集时间
    dd.pl-4
      TimeWidget(:value="value.collectTime")
      slot(name="recollect-button")
    template(v-for="i in value.metadata")
      template(v-if="i.k === 'cgteamwork.pipeline'")
      template(v-else-if="i.k === 'cgteamwork.tasks'")
        dt CGTeamwork
        CollectionMetadataCGTeamworkTasks.pl-4(tag="dd" :value="i.v" :id="value.id")
        p.text-center.text-sm.text-gray-600 点击状态进行更改
        CGTeamworkNoteList.pl-4(:id="value.id")
      template(v-else-if="i.k === 'comment'")
      template(v-else)
        dt {{i.k}}
        dd.pl-4 {{i.v}}
    dt 标签
    dd.pl-4
      CollectionTags(:id="value.id" class="w-full")
    dt(
      @click="() => $refs.comment.focus()"
    ) 留言
    CollectionMetadataComment.pl-4.w-full(ref="comment" :value="value" tag="dd")
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Collection } from '../graphql/types/Collection';
import CollectionMetadataCGTeamworkTasks from './CollectionMetadataCGTeamworkTasks.vue';
import CollectionMetadataComment from './CollectionMetadataComment.vue';
import CGTeamworkNoteList from './cgteamwork/CGTeamworkNoteList.vue';
import CollectionTags from '@/components/CollectionTags.vue';


@Component<CollectionMetadata>({
  components: {
    CollectionMetadataCGTeamworkTasks,
    CollectionMetadataComment,
    CollectionTags,
    CGTeamworkNoteList,
  },
})
export default class CollectionMetadata extends Vue {
  @Prop({ type: Object, required: true })
  value!: Collection;
}
</script>
