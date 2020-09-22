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
        CollectionMetadataCGTeamworkTasks.pl-4(tag="dd" :value="i.v")
      template(v-else-if="i.k === 'comment'")
      template(v-else)
        dt {{i.k}}
        dd.pl-4 {{i.v}}
    dt(
      @click="() => $refs.comment.focus()"
    ) 留言
    CollectionMetadataComment.pl-4.w-full(ref="comment" :value="value" tag="dd")
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { collection as Collection } from '../graphql/types/collection';
import CollectionMetadataCGTeamworkTasks from './CollectionMetadataCGTeamworkTasks.vue';
import CollectionMetadataComment from './CollectionMetadataComment.vue';

@Component<CollectionMetadata>({
  components: { CollectionMetadataCGTeamworkTasks, CollectionMetadataComment },
})
export default class CollectionMetadata extends Vue {
  @Prop({ type: Object, required: true })
  value!: Collection;
}
</script>
