<template lang="pug">
  figure.collection-overview-cell.inline-block.relative(
    class="cursor-pointer flex items-center"
    @click="$emit('click', $event)"
    :title="node && node.title"
    :class=`{[backgroundClass]: true}`
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
          FunctionalComponent(:render="renderTopLeft")
          FunctionalComponent(:render="renderTopRight")
        caption(
          class="absolute text-center w-full bottom-0 text-gray-400 text-sm"
        ) {{node && node.title}}
    Presentation.w-full(
      ref="presentation"
      :id="presentation"
      :image-filter=`imageFilter`
    )
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Collection } from '../graphql/types/Collection';
import Presentation from './Presentation.vue';
import * as cast from 'cast-unknown';
import { sortBy } from 'lodash';
import CGTeamworkTaskStatus from './cgteamwork/CGTeamworkTaskStatus.vue';
import db from '@/db';
import { CreateElement, VNode } from 'vue';
import {
  collectionNodeVariables,
  collectionNode,
} from '@/graphql/types/collectionNode';
import { filePathFormat } from '@/const';

@Component<CollectionOverviewCell>({
  components: { Presentation, CGTeamworkTaskStatus },
  apollo: {
    node: {
      query: require('@/graphql/queries/collectionNode.gql'),
      variables(): collectionNodeVariables {
        return { id: this.id, filePathFormat };
      },
      skip(): boolean {
        return !this.id;
      },
      update(v: collectionNode): Collection | undefined {
        return v.node?.__typename === 'Collection' ? v.node : undefined;
      },
    },
  },
})
export default class CollectionOverviewCell extends Vue {
  @Prop({ type: String, required: true })
  id!: string;

  node?: Collection;

  $refs!: {
    presentation: Presentation;
  };

  get overlayVisible(): boolean {
    return db.preference.get('cellOverlayVisible');
  }

  get cgteamworkArtists(): string[] {
    const pipeline = this.node?.metadata.find(
      i => i.k === 'cgteamwork.pipeline'
    )?.v;
    if (!pipeline) {
      return [];
    }
    for (const { k, v } of this.node?.metadata ?? []) {
      switch (k) {
        case 'cgteamwork.tasks':
          return cast
            .array(JSON.parse(v))
            .map(cast.object)
            .filter(i => cast.string(i.pipeline) === pipeline)
            .flatMap(i => cast.array(i.artists).map(cast.string));
      }
    }
    return [];
  }

  get cgteamworkTaskStatus(): string {
    const statusPriority: Record<string, number | undefined> = {
      Approve: 1,
      Wait: 2,
      Check: 3,
      Retake: 4,
      Close: 5,
    };
    const data = this.node?.metadata.find(i => i.k === 'cgteamwork.tasks')?.v;
    const pipeline = this.node?.metadata.find(
      i => i.k === 'cgteamwork.pipeline'
    )?.v;
    let ret = '';
    if (!(data && pipeline)) {
      return '';
    }
    for (const i of cast.array(JSON.parse(data))) {
      const status = i?.status?.[db.preference.get('cgteamworkStage')];
      if ((statusPriority[status] ?? 0) > (statusPriority[ret] ?? 0)) {
        ret = status;
      }
    }
    return ret;
  }

  get presentation(): string {
    return sortBy(this.node?.presentations ?? [], [
      i => !i.thumb,
      i => -new Date(i.raw.modTime).getTime(),
      i => i.id,
    ])[0]?.id;
  }

  get backgroundClass(): string {
    switch (db.preference.get('viewerBackground')) {
      case 'checkboard':
        return 'bg-checkboard-sm';
      case 'checkboard-sm':
        return 'bg-checkboard-xs';
      case 'white':
        return 'bg-white';
      default:
        return 'bg-black';
    }
  }

  imageFilter(p: Presentation): string {
    if (p.isLoadFailed || p.isTranscodeFailed || !p.id) {
      switch (p.size) {
        case 'regular':
          return '';
        case 'thumb':
        default:
          switch (db.preference.get('viewerBackground')) {
            case 'white':
              return '';
            default:
              return 'brightness(0.3)';
          }
      }
    }
    return '';
  }

  renderTopLeft(h: CreateElement): VNode {
    return h(
      'div',
      this.cgteamworkArtists.map(i =>
        h('span', { staticClass: 'artist mr-1' }, i)
      )
    );
  }

  renderTopRight(h: CreateElement): VNode | undefined {
    if (this.cgteamworkTaskStatus) {
      return h(CGTeamworkTaskStatus, {
        staticClass: 'rounded-sm px-2',
        props: { value: this.cgteamworkTaskStatus },
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.collection-overview-cell {
  .overlay {
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0.1) 20%,
      rgba(0, 0, 0, 0) 30%,
      rgba(0, 0, 0, 0) 70%,
      rgba(0, 0, 0, 0.1) 80%,
      rgba(0, 0, 0, 0.5) 100%
    );
  }
}
</style>
