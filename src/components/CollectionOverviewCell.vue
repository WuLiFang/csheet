<template lang="pug">
  figure.collection-overview-cell.inline-block.relative(
    ref="el"
    class="cursor-pointer flex items-center max-h-64 overflow-hidden"
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
        class="absolute inset-0 pointer-events-none"
        v-show="isCellOverlayVisible"
      )
        header(
          class="flex justify-between opacity-75 p-1"
        )
          FunctionalComponent(:render="renderTopLeft")
          FunctionalComponent(:render="renderTopRight")
        caption(
          class="absolute text-center w-full bottom-0 text-gray-400 text-sm break-all p-1"
        ) {{node && node.title}}
    Presentation.w-full(
      ref="presentationVue"
      :id="presentation"
      :class="presentationClass"
      :image-filter=`imageFilter`
    )
</template>

<script lang="ts">
import { filePathFormat } from '@/const';
import {
  collectionNode,
  collectionNodeVariables,
} from '@/graphql/types/collectionNode';
import { isCellOverlayVisible } from '@/preference';
import { computed, ref } from '@vue/composition-api';
import * as cast from 'cast-unknown';
import { sortBy } from 'lodash';
import { CreateElement, VNode } from 'vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Collection } from '../graphql/types/Collection';
import CGTeamworkStatusWidget from './cgteamwork/CGTeamworkStatusWidget.vue';
import {
  backgroundClass,
  imageFilter,
  usePresentationClass,
} from './CollectionOverviewCell';
import PresentationVue from './Presentation.vue';

@Component<CollectionOverviewCell>({
  components: { Presentation: PresentationVue, CGTeamworkStatusWidget },
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

  setup() {
    const el = ref<HTMLElement | undefined>();
    const presentationVue = ref<PresentationVue | undefined>();
    const presentationClass = usePresentationClass(
      el,
      computed(() => presentationVue.value?.node)
    );

    return {
      el,
      isCellOverlayVisible,
      backgroundClass,
      presentationVue,
      presentationClass,
      imageFilter: (p: PresentationVue) => imageFilter(p),
    };
  },
})
export default class CollectionOverviewCell extends Vue {
  @Prop({ type: String, required: true })
  id!: string;

  node?: Collection;

  $refs!: {
    presentationVue: PresentationVue;
  };

  get cgteamworkArtists(): string[] {
    const pipeline = this.node?.metadata.find(
      (i) => i.k === 'cgteamwork.pipeline'
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
            .filter((i) => cast.string(i.pipeline) === pipeline)
            .flatMap((i) => cast.array(i.artists).map(cast.string));
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
    const data = this.node?.metadata.find((i) => i.k === 'cgteamwork.tasks')?.v;
    const pipeline = this.node?.metadata.find(
      (i) => i.k === 'cgteamwork.pipeline'
    )?.v;
    let ret = '';
    if (!(data && pipeline)) {
      return '';
    }
    for (const i of cast.array(JSON.parse(data))) {
      for (const status of Object.values(i?.status).map(cast.string)) {
        if ((statusPriority[status] ?? 0) > (statusPriority[ret] ?? 0)) {
          ret = status;
        }
      }
    }
    return ret;
  }

  get presentation(): string {
    return sortBy(this.node?.presentations ?? [], [
      (i) => !i.thumb,
      (i) => -new Date(i.raw.modTime || 0).getTime(),
      (i) => i.id,
    ])[0]?.id;
  }

  renderTopLeft(h: CreateElement): VNode {
    return h(
      'div',
      this.cgteamworkArtists.map((i) =>
        h('span', { staticClass: 'artist mr-1' }, i)
      )
    );
  }

  renderTopRight(h: CreateElement): VNode | undefined {
    if (this.cgteamworkTaskStatus) {
      return h(CGTeamworkStatusWidget, {
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
