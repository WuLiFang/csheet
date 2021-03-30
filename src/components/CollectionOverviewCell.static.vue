<template>
  <figure
    ref="el"
    class="collection-overview-cell inline-block relative cursor-pointer flex items-center max-h-64 overflow-hidden"
    :title="value.title"
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
        class="overlay absolute inset-0 pointer-events-none"
      >
        <header class="flex justify-between opacity-75 p-1">
          <FunctionalComponent :render="renderTopLeft"></FunctionalComponent>
          <FunctionalComponent :render="renderTopRight"></FunctionalComponent>
        </header>
        <caption
          class="absolute text-center w-full bottom-0 text-gray-400 text-sm break-all p-1"
        >
          {{
            value.title
          }}
        </caption>
      </div>
    </transition>
    <Presentation
      ref="presentationVue"
      :value="presentation"
      class="w-full"
      :class="presentationClass"
      :image-filter="imageFilter"
    ></Presentation>
  </figure>
</template>

<script lang="ts">
import CGTeamworkStatusWidget from '@/components/cgteamwork/CGTeamworkStatusWidget.static.vue';
import useCollectionCGTeamworkArtists from '@/composables/useCollectionCGTeamworkArtists';
import useCollectionCGTeamworkTaskStatus from '@/composables/useCollectionCGTeamworkTaskStatus';
import useElementSize from '@/composables/useElementSize';
import useObjectContainRate from '@/composables/useObjectContainRate';
import usePresentationMetadata from '@/composables/usePresentationMetadata';
import type { Collection } from '@/graphql/types/Collection';
import type { Presentation } from '@/graphql/types/Presentation';
import { isCellOverlayVisible, viewerBackground } from '@/preference';
import { computed, defineComponent, PropType, ref } from '@vue/composition-api';
import { sortBy } from 'lodash';
import { CreateElement, VNode } from 'vue';
import PresentationVue from './Presentation.static.vue';
export default defineComponent({
  name: 'CollectionOverviewCell',
  components: {
    Presentation: PresentationVue,
  },
  props: {
    value: {
      type: Object as PropType<Collection>,
      required: true,
    },
  },
  setup: (props) => {
    const el = ref<HTMLElement | undefined>();

    const presentation = computed((): Presentation | undefined => {
      return sortBy(props.value.presentations ?? [], [
        (i) => !i.thumb,
        (i) => -new Date(i.raw.modTime || 0).getTime(),
        (i) => i.id,
      ])[0];
    });
    const presentationVue = ref<PresentationVue | undefined>();
    const { width: outerWidth, height: outerHeight } = useElementSize(el);
    const { width: innerWidth, height: innerHeight } = usePresentationMetadata(
      computed(() => presentationVue.value?.node)
    );
    const objectContainRate = useObjectContainRate(
      outerWidth,
      outerHeight,
      innerWidth,
      innerHeight
    );

    const presentationClass = computed(() => {
      if (objectContainRate.value > 0.618) {
        return '';
      } else if (innerWidth < innerHeight) {
        return 'object-cover w-full max-h-64';
      } else {
        return 'object-cover h-full max-w-full';
      }
    });
    const backgroundClass = computed((): string => {
      switch (viewerBackground.value) {
        case 'checkboard':
          return 'bg-checkboard-sm';
        case 'checkboard-sm':
          return 'bg-checkboard-xs';
        case 'white':
          return 'bg-white';
        default:
          return 'bg-black';
      }
    });

    const cgteamworkTaskStatus = useCollectionCGTeamworkTaskStatus(
      computed(() => props.value)
    );
    const cgteamworkArtists = useCollectionCGTeamworkArtists(
      computed(() => props.value)
    );
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
    const imageFilter = (p: PresentationVue): string => {
      if (p.isLoadFailed || p.isTranscodeFailed || !p.value) {
        switch (p.size) {
          case 'regular':
            return '';
          case 'thumb':
          default:
            switch (viewerBackground.value) {
              case 'white':
                return '';
              default:
                return 'brightness(0.3)';
            }
        }
      }
      return '';
    };

    return {
      el,
      presentation,
      presentationVue,
      presentationClass,
      isCellOverlayVisible,
      backgroundClass,
      renderTopLeft,
      renderTopRight,
      imageFilter,
    };
  },
});
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
