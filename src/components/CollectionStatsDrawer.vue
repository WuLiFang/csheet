<template>
  <Drawer :visible.sync="visible" container-class="w-full" v-on="$listeners">
    <template #title>收藏统计</template>
    <OriginPrefixInput v-model="variables.originPrefix" />
    <div class="inline-block text-center space-x-1">
      <span class="mr-1">筛选</span>
      <CollectionTagInput
        v-model="variables.tagOr"
        multiple
        input-class="w-32"
        placeholder="匹配任一标签"
        clearable
        class="max-w-md"
      />
      <CollectionTagInput
        v-model="variables.tagAnd"
        multiple
        input-class="w-32"
        placeholder="匹配全部标签"
        clearable
        class="max-w-md"
      />
    </div>
    <CollectionStats
      :variables="{
        ...variables,
        tagOr: optionalArray(variables.tagOr),
      }"
    />
  </Drawer>
</template>

<script lang="ts">
import CollectionStats from '@/components/CollectionStats.vue';
import CollectionTagInput from '@/components/CollectionTagInput.vue';
import OriginPrefixInput from '@/components/OriginPrefixInput.vue';
import { collectionStatsVariables } from '@/graphql/types/collectionStats';
import optionalArray from '@/utils/optionalArray';
import { defineComponent, PropType, ref } from '@vue/composition-api';

export default defineComponent({
  name: 'CollectionStatsDrawer',
  props: {
    defaultVariables: {
      type: Object as PropType<Partial<collectionStatsVariables>>,
    },
  },
  components: {
    CollectionStats,
    OriginPrefixInput,
    CollectionTagInput,
  },
  setup: (props) => {
    const variables = ref<collectionStatsVariables>({
      ...props.defaultVariables,
    });
    const visible = ref(true);

    return { visible, variables, optionalArray };
  },
});
</script>
