<template lang="pug">
  figure.collection-overview-cell.inline-block.relative(
    class="cursor-pointer flex items-center"
    @click="$emit('click', $event)"
    :title="value.title"
  )
    transition(
      enter-class="opacity-0"
      leave-to-class="opacity-0"
      enter-active-class="transition-all duration-500 ease-in-out"
      leave-active-class="transition-all duration-500 ease-in-out"
    )
      .overlay(
        class="absolute inset-0 p-1 pointer-events-none"
        v-show="overlayVisible"
      )
        header(
          class="flex justify-between opacity-75"
        )
          span {{topLeftText}}
          CGTeamworkTaskStatus(
            class="rounded-sm px-2"
            v-if="cgteamworkTaskStatus"
            :value="cgteamworkTaskStatus"
          )
        caption(
          class="absolute text-center w-full bottom-0 text-gray-400 text-sm"
        ) {{value.title}}
    Presentation.w-full(:id="presentation")
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { collection as Collection } from '../graphql/types/collection';
import Presentation from './Presentation.vue';
import * as cast from 'cast-unknown';
import { sortBy } from 'lodash';
import CGTeamworkTaskStatus from './CGTeamworkTaskStatus.vue';
import * as preference from '@/preference';

@Component<CollectionOverviewCell>({
  components: { Presentation, CGTeamworkTaskStatus },
})
export default class CollectionOverviewCell extends Vue {
  @Prop({ type: Object, required: true })
  value!: Collection;

  get overlayVisible(): boolean {
    return preference.get('cellOverlayVisible');
  }

  get topLeftText(): string {
    let ret = '';
    const pipeline = this.value.metadata.find(
      i => i.k === 'cgteamwork.pipeline'
    )?.v;
    for (const { k, v } of this.value.metadata) {
      switch (k) {
        case 'cgteamwork.tasks':
          ret += cast
            .array(JSON.parse(v))
            .map(cast.object)
            .filter(i => cast.string(i.pipeline) === pipeline)
            .flatMap(i => cast.array(i.artists).map(cast.string))
            .join(',');
          break;
      }
    }
    return ret;
  }

  get cgteamworkTaskStatus(): string {
    const statusPriority: Record<string, number | undefined> = {
      Approve: 1,
      Wait: 2,
      Check: 3,
      Retake: 4,
      Close: 5,
    };
    const data = this.value.metadata.find(i => i.k === 'cgteamwork.tasks')?.v;
    const pipeline = this.value.metadata.find(
      i => i.k === 'cgteamwork.pipeline'
    )?.v;
    let ret = '';
    if (!(data && pipeline)) {
      return '';
    }
    for (const i of cast.array(JSON.parse(data))) {
      const status = i?.status?.[preference.get('cgteamworkStage')];
      if ((statusPriority[status] ?? 0) > (statusPriority[ret] ?? 0)) {
        ret = status;
      }
    }
    return ret;
  }

  get presentation(): string {
    return sortBy(this.value.presentations, [
      i => !i.thumb,
      i => -new Date(i.raw.modTime).getTime(),
      i => i.id,
    ])[0]?.id;
  }
}
</script>

<style lang="scss" scoped>
.collection-overview-cell {
  .overlay {
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.6) 0%,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 0) 70%,
      rgba(0, 0, 0, 0.4) 100%
    );
  }
}
</style>
