<template>
  <div
    :class="{
      'text-gray-500': loadingCount > 0,
    }"
  >
    <section>
      <h2 class="font-bold text-lg">总计</h2>
      <dl class="ml-2">
        <div>
          <dd class="inline-block w-16 mr-2 text-right">
            {{ loadingCount > 0 ? totalCount || '...' : totalCount }}
          </dd>
          <dt class="inline-block">收藏</dt>
        </div>
        <div>
          <dd class="inline-block w-16 mr-2 text-right">
            {{ loadingCount > 0 ? totalTagCount || '...' : totalTagCount }}
          </dd>
          <dt class="inline-block">标签</dt>
        </div>
      </dl>
    </section>
    <section>
      <h2 class="font-bold text-lg">标签</h2>
      <CollectionTagTreemap :variables="variables" />
      <details>
        <div class="ml-1">
          <div v-for="i in groupedData" :key="i.group" open>
            <h3 class="text-lg">
              {{ i.group }}
            </h3>
            <dl class="ml-1">
              <div v-for="v in i.values" :key="v.name">
                <dd class="inline-block text-right w-16 mr-2">{{ v.count }}</dd>
                <dt class="inline-block">{{ v.name }}</dt>
              </div>
            </dl>
          </div>
        </div>
      </details>
    </section>
  </div>
</template>

<script lang="ts">
import CollectionTagTreemap from '@/components/CollectionTagTreemap.vue';
import queries from '@/graphql/queries';
import { collectionStatsVariables } from '@/graphql/types/collectionStats';
import {
  computed,
  defineComponent,
  PropType,
  ref,
  toRefs,
} from '@vue/composition-api';
import { groupBy, sortBy } from 'lodash';

export default defineComponent({
  name: 'CollectionStats',
  props: {
    variables: {
      type: Object as PropType<collectionStatsVariables>,
      default: () => ({}),
    },
  },
  components: {
    CollectionTagTreemap,
  },
  setup: (props) => {
    const { variables } = toRefs(props);
    const loadingCount = ref(0);
    const { data } = queries.useCollectionStats(
      variables,
      computed(() => ({
        fetchPolicy: 'cache-and-network',
        loadingCount,
      }))
    );
    const groupedData = computed(() => {
      const normalizedData = (data.value?.collections.tagCount ?? []).map((i): {
        group: string;
        name: string;
        count: number;
      } => {
        const lastColonIndex = i.tag.lastIndexOf(':');
        if (lastColonIndex < 0) {
          return {
            group: '',
            name: i.tag,
            count: i.count,
          };
        }
        return {
          group: i.tag.slice(0, lastColonIndex),
          name: i.tag.slice(lastColonIndex + 1),
          count: i.count,
        };
      });
      return sortBy(
        Object.entries(groupBy(normalizedData, (i) => i.group)).map(
          ([k, v]) => ({
            group: k,
            values: sortBy(
              v.map((i) => ({
                name: i.name,
                count: i.count,
              })),
              [(i) => -i.count, (i) => i.name]
            ),
          })
        ),
        [(i) => !!i.group, (i) => i.group]
      );
    });
    const totalCount = computed(() => data.value?.collections.totalCount ?? 0);
    const totalTagCount = computed(
      () =>
        data.value?.collections.tagCount
          ?.map((i) => i.count)
          .reduce((a, b) => a + b, 0) ?? 0
    );
    return {
      data,
      groupedData,
      totalCount,
      totalTagCount,
      loadingCount,
    };
  },
});
</script>
