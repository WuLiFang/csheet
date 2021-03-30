<template>
  <nav id="navbar">
    <form ref="form" action="javascript:void(0)">
      <div class="inline-block mr-1 space-x-1">
        <span class="mr-1">筛选</span>
        <CollectionTagInput
          v-model="formData.tagOr"
          class="max-w-md"
          multiple="multiple"
          input-class="w-32"
          placeholder="匹配任一标签"
          clearable="clearable"
        ></CollectionTagInput>
        <CollectionTagInput
          v-model="formData.tagAnd"
          class="max-w-md"
          multiple="multiple"
          input-class="w-32"
          placeholder="匹配全部标签"
          clearable="clearable"
        ></CollectionTagInput>
        <label v-if="supportsSkipEmpty" class="inline-block keep-all">
          <input
            v-model="formData.skipEmptyPresentation"
            class="form-checkbox text-gray-900"
            type="checkbox"
          /><span class="mx-1">跳过无内容</span>
        </label>
      </div>
      <label class="inline-block keep-all">
        <input
          v-model="isCellOverlayVisible"
          class="form-checkbox text-gray-900"
          type="checkbox"
        /><span class="mx-1">信息显示</span>
      </label>
      <button
        class="form-button ml-1"
        type="button"
        title="统计"
        @click="showStats()"
      >
        <FaIcon name="chart-pie"></FaIcon>
      </button>
    </form>
  </nav>
</template>

<script lang="ts">
import CollectionStatsDrawerVue from '@/components/CollectionStatsDrawer.static.vue';
import CollectionTagInput from '@/components/CollectionTagInput.static.vue';
import { collectionsVariables } from '@/graphql/types/collections';
import { show } from '@/modal';
import { isCellOverlayVisible } from '@/preference';
import searchParamsSetAll from '@/utils/searchParamSetAll';
import {
  computed,
  defineComponent,
  onUnmounted,
  reactive,
  watch,
} from '@vue/composition-api';
import 'vue-awesome/icons/chart-pie';
import { PAGE_DATA } from '@/page-data.static';

export default defineComponent({
  name: 'TheNavbar',
  components: {
    CollectionTagInput,
  },
  setup: (props, ctx) => {
    const formData = reactive({
      tagOr: [] as string[],
      tagAnd: [] as string[],
      skipEmptyPresentation: false,
    });
    const variables = computed<collectionsVariables>(() => {
      return {
        presentationCountGt: formData.skipEmptyPresentation ? 0 : undefined,
        tagOr: formData.tagOr.length > 0 ? formData.tagOr : undefined,
        tagAnd: formData.tagAnd.length > 0 ? formData.tagAnd : undefined,
      };
    });
    const supportsSkipEmpty = computed(
      () =>
        PAGE_DATA.value.collections.nodes?.some((i) =>
          i ? i.presentations.length === 0 : false
        ) ?? false
    );
    watch(
      variables,
      (v) => {
        ctx.emit('update:variables', v);
      },
      { immediate: true }
    );

    const loadState = () => {
      const q = new URLSearchParams(location.search);
      if (q.get('skip_empty')) {
        formData.skipEmptyPresentation = true;
      }
      formData.tagOr = q.getAll('tag_or');
      formData.tagAnd = q.getAll('tag_and');
    };
    loadState();
    window.addEventListener('popstate', loadState);
    onUnmounted(() => window.removeEventListener('popstate', loadState));

    const saveState = async () => {
      const u = new URL(location.href);
      u.search = '';
      if (formData.skipEmptyPresentation) {
        u.searchParams.set('skip_empty', '1');
      }
      searchParamsSetAll(u.searchParams, 'tag_or', formData.tagOr);
      searchParamsSetAll(u.searchParams, 'tag_and', formData.tagAnd);

      const url = u.toString();
      if (url === location.href) {
        return;
      }

      history.replaceState(null, document.title, url);
    };
    watch(
      formData,
      () => {
        saveState();
      },
      { deep: true, immediate: true }
    );

    const showStats = (): void => {
      show(CollectionStatsDrawerVue, {
        props: {
          defaultVariables: variables,
        },
      });
    };

    return {
      formData,
      showStats,
      isCellOverlayVisible,
      supportsSkipEmpty,
    };
  },
});
</script>
