<template>
  <Drawer :visible.sync="visible" container-class="w-full" v-on="$listeners">
    <template #title>收藏统计</template>
    <CollectionStats :variables="variables" />
  </Drawer>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from '@vue/composition-api';
import CollectionStats from '@/components/CollectionStats.vue';
import { collectionStatsVariables } from '@/graphql/types/collectionStats';

// TODO: add form to change variables
export default defineComponent({
  name: 'CollectionStatsDrawer',
  inheritAttrs: false,
  props: {
    defaultVariables: {
      type: Object as PropType<Partial<collectionStatsVariables>>,
    },
  },
  components: {
    CollectionStats,
  },
  setup: (props) => {
    const variables = ref<collectionStatsVariables>({
      ...props.defaultVariables,
    });
    const visible = ref(true);
    return { visible, variables };
  },
});
</script>
