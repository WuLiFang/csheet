<template>
  <figure
    ref="el"
    class="collection-overview-cell relative cursor-pointer flex items-center max-h-64 overflow-hidden"
    :title="node && node.title"
    :class="{ [backgroundClass]: true }"
    @click="$emit('click', $event)"
  >
    <transition
      enter-class="opacity-0"
      leave-to-class="opacity-0"
      enter-active-class="transition-all duration-500 ease-in-out"
      leave-active-class="transition-all duration-500 ease-in-out"
    >
      <div
        v-show="isCellOverlayVisible"
        class="bg-gradient-overlay absolute inset-0 pointer-events-none"
      >
        <header class="flex justify-between opacity-75 p-1">
          <FunctionalComponent :render="renderTopLeft"></FunctionalComponent>
          <FunctionalComponent :render="renderTopRight"></FunctionalComponent>
        </header>
        <caption
          class="absolute text-center w-full bottom-0 text-gray-400 text-sm break-all p-1"
        >
          {{
            node && node.title
          }}
        </caption>
      </div>
    </transition>
    <Presentation
      :id="presentation && presentation.id"
      draggable
      class="w-full"
      :class="presentationClass"
      :image-filter="imageFilter"
    ></Presentation>
  </figure>
</template>

<script lang="ts">
import CGTeamworkStatusWidget from '@/components/cgteamwork/CGTeamworkStatusWidget.vue';
import { imageFilter, setupCommon } from '@/components/CollectionOverviewCell';
import { filePathFormat } from '@/const';
import { useCollectionNode } from '@/graphql/queries/index.queries';
import { isCellOverlayVisible } from '@/preference';
import { computed, defineComponent, ref } from '@vue/composition-api';
import { CreateElement, VNode } from 'vue';
import PresentationVue from './Presentation.vue';

export default defineComponent({
  name: 'CollectionOverviewCell',
  components: {
    Presentation: PresentationVue,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup: (props) => {
    const el = ref<HTMLElement | undefined>();
    const { node } = useCollectionNode(
      computed(() => ({
        id: props.id,
        filePathFormat,
      }))
    );
    const {
      backgroundClass,
      cgteamworkArtists,
      cgteamworkTaskStatus,
      presentation,
      presentationClass,
    } = setupCommon(el, node);
    const renderTopLeft = (h: CreateElement): VNode => {
      return h(
        'div',
        cgteamworkArtists.value.map((i) =>
          h('span', { staticClass: 'artist mr-1' }, i)
        )
      );
    };

    const renderTopRight = (h: CreateElement): VNode | undefined => {
      if (cgteamworkTaskStatus.value) {
        return h(CGTeamworkStatusWidget, {
          staticClass: 'rounded-sm px-2',
          props: { value: cgteamworkTaskStatus.value },
        });
      }
    };

    return {
      el,
      presentation,
      presentationClass,
      isCellOverlayVisible,
      backgroundClass,
      renderTopLeft,
      renderTopRight,
      node,
      imageFilter: (p: PresentationVue) => imageFilter(p),
    };
  },
});
</script>
