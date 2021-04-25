<template>
  <nav id="navbar">
    <form ref="form" action="javascript:void(0)" @submit="collect()">
      <div class="mr-1 lg:mr-2 inline-block">
        <OriginPrefixInput
          ref="originPrefixInput"
          v-model="formData.originPrefix"
          @change:mode="isHistoryStateChanged = true"
          @change:cgteamwork:database="isHistoryStateChanged = true"
        ></OriginPrefixInput>
        <button
          ref="collectButton"
          class="form-button mr-1 w-24"
          type="submit"
          :disabled="loadingCount > 0"
        >
          <template v-if="loadingCount > 0">
            <FaIcon name="spinner" spin="spin"></FaIcon>
          </template>
          <template v-else>收集</template>
        </button>
      </div>
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
        <label class="inline-block keep-all">
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
        <FaIcon name="chart-pie"></FaIcon></button
      ><a download="download" :href="archiveURL">
        <button class="form-button ml-1" type="button" title="归档打包">
          <FaIcon name="archive"></FaIcon></button
      ></a>
    </form>
  </nav>
</template>

<script lang="ts">
import {
  CGTeamworkOriginPrefix,
  FolderOriginPrefix,
  OriginPrefix,
} from '@/client/origin-prefix';
import CollectionStatsDrawerVue from '@/components/CollectionStatsDrawer.vue';
import CollectionTagInput from '@/components/CollectionTagInput.vue';
import OriginPrefixInput from '@/components/OriginPrefixInput.vue';
import useLocation from '@/composables/useLocation';
import usePromise from '@/composables/usePromise';
import { filePathFormat } from '@/const';
import db from '@/db';
import mutations from '@/graphql/mutations';
import queries from '@/graphql/queries';
import { info } from '@/message';
import { show } from '@/modal';
import { isCellOverlayVisible } from '@/preference';
import searchParamsSetAll from '@/utils/searchParamSetAll';
import {
  computed,
  defineComponent,
  reactive,
  ref,
  watch,
  watchEffect,
} from '@vue/composition-api';
import 'vue-awesome/icons/archive';
import 'vue-awesome/icons/chart-pie';
import { collectionsVariables } from '../graphql/types/collections';

function getResultMessage({
  createdCount,
  updatedCount,
}: {
  createdCount?: number;
  updatedCount?: number;
}): string {
  if (createdCount && updatedCount) {
    return `创建了 ${createdCount} 个并更新了 ${updatedCount} 个收藏`;
  }
  if (createdCount) {
    return `创建了 ${createdCount} 个收藏`;
  }
  if (updatedCount === 0) {
    return `更新了 ${updatedCount} 个收藏，请检查参数`;
  }
  return `更新了 ${updatedCount} 个收藏`;
}

export default defineComponent({
  name: 'TheNavbar',
  components: {
    OriginPrefixInput,
    CollectionTagInput,
  },
  setup: (props, ctx) => {
    const location = useLocation();
    const originPrefixInput = ref<InstanceType<typeof OriginPrefixInput>>();
    const form = ref<HTMLFormElement>();
    const formData = reactive({
      originPrefix: '',
      tagOr: [] as string[],
      tagAnd: [] as string[],
      skipEmptyPresentation: false,
    });

    const originPrefix = computed(() =>
      OriginPrefix.parse(formData.originPrefix)
    );

    const variables = computed<collectionsVariables>(() => {
      return {
        originPrefix: formData.originPrefix,
        presentationCountGt: formData.skipEmptyPresentation ? 0 : undefined,
        tagOr: formData.tagOr.length > 0 ? formData.tagOr : undefined,
        tagAnd: formData.tagAnd.length > 0 ? formData.tagAnd : undefined,
      };
    });
    watch(
      variables,
      (v) => {
        ctx.emit('update:variables', v);
      },
      { immediate: true }
    );

    const isHistoryStateChanged = ref(false);

    // load state
    watch(
      location,
      () => {
        const q = new URLSearchParams(location.value.search);
        switch (q.get('mode')) {
          case 'cgteamwork':
            formData.originPrefix = new CGTeamworkOriginPrefix(
              q.get('db') ?? '',
              q.get('pipeline') ?? '',
              q.get('prefix') ?? ''
            ).toString();
            break;
          case 'folder':
            formData.originPrefix = new FolderOriginPrefix(
              q.get('root') ?? ''
            ).toString();
            break;
          default: {
            const latest = db.recentOriginPrefix.get()[0];
            if (latest) {
              formData.originPrefix = latest.toString();
            }
          }
        }
        if (q.get('skip_empty')) {
          formData.skipEmptyPresentation = true;
        }
        formData.tagOr = q.getAll('tagOr');
        formData.tagAnd = q.getAll('tagAnd');
      },
      { immediate: true }
    );

    const title = usePromise(
      computed(async () => {
        const parts: string[] = [];
        if (originPrefix.value instanceof CGTeamworkOriginPrefix) {
          const project =
            (
              await queries.cgteamworkProjects({
                database: [originPrefix.value.database],
              })
            ).data.cgteamworkProjects?.[0]?.name ?? originPrefix.value.database;
          parts.push(
            originPrefix.value.prefix,
            project,
            originPrefix.value.pipeline
          );
        }
        if (originPrefix.value instanceof FolderOriginPrefix) {
          parts.push(originPrefix.value.root);
        }
        parts.push('色板');
        return parts.filter((i) => !!i).join(' - ');
      }),
      ref('色板')
    );
    watchEffect(() => {
      document.title = title.value;
    });

    // save state
    watch(
      formData,
      () => {
        const u = new URL(location.value.href);
        u.search = '';
        if (originPrefix.value instanceof CGTeamworkOriginPrefix) {
          u.searchParams.set('mode', 'cgteamwork');
          u.searchParams.set('db', originPrefix.value.database);
          u.searchParams.set('pipeline', originPrefix.value.pipeline);
          u.searchParams.set('prefix', originPrefix.value.prefix);
        } else if (originPrefix.value instanceof FolderOriginPrefix) {
          u.searchParams.set('mode', 'folder');
          u.searchParams.set('root', originPrefix.value.root);
        }
        if (formData.skipEmptyPresentation) {
          u.searchParams.set('skip_empty', '1');
        }
        searchParamsSetAll(u.searchParams, 'tagOr', formData.tagOr);
        searchParamsSetAll(u.searchParams, 'tagAnd', formData.tagAnd);

        const url = u.toString();
        if (url === location.value.href) {
          return;
        }

        if (isHistoryStateChanged.value) {
          history.pushState(null, title.value, url);
        } else {
          history.replaceState(null, title.value, url);
        }
        isHistoryStateChanged.value = false;
      },
      { deep: true, immediate: true }
    );

    const showStats = (): void => {
      show(CollectionStatsDrawerVue, {
        props: {
          defaultVariables: variables.value,
        },
      });
    };

    const archiveURL = computed(() => {
      const u = new URL(location.value.href);
      u.search = '';
      u.pathname = '/archive';
      if (formData.originPrefix) {
        u.searchParams.set('origin_prefix', formData.originPrefix);
      }
      if (formData.skipEmptyPresentation) {
        u.searchParams.set('presentation_count_gt', '0');
      }
      searchParamsSetAll(u.searchParams, 'tag_or', formData.tagOr);
      searchParamsSetAll(u.searchParams, 'tag_and', formData.tagAnd);
      u.searchParams.set('title', title.value);
      if (filePathFormat) {
        u.searchParams.set('file_path_format', filePathFormat);
      }
      return u;
    });

    const loadingCount = ref(0);
    const collect = async (): Promise<void> => {
      isHistoryStateChanged.value = true;
      if (loadingCount.value > 0) {
        return;
      }
      loadingCount.value += 1;
      try {
        if (originPrefix.value instanceof CGTeamworkOriginPrefix) {
          const { data, errors } = await mutations.collectFromCGTeamwork(
            {
              input: {
                database: originPrefix.value.database,
                prefix: originPrefix.value.prefix,
                pipeline: originPrefix.value.pipeline,
              },
            },
            { errorPolicy: 'all' }
          );
          for (const err of errors ?? []) {
            switch (err.extensions?.code) {
              case 'CGTEAMWORK_COLLECT_OVER_TASK_LIMIT':
                originPrefixInput.value?.cgteamworkPrefixInput?.setCustomValidity(
                  '请使用更精确的前缀匹配来匹配更少的任务，如一集或一场。'
                );
                break;
              default:
              // other error handled in onError middleware
            }
            form.value?.reportValidity();
            return;
          }
          ctx.emit('collect');
          info(getResultMessage(data?.collectFromCGTeamwork ?? {}));
        } else if (originPrefix.value instanceof FolderOriginPrefix) {
          const { data } = await mutations.collectFromFolder({
            input: {
              root: originPrefix.value.root,
            },
          });
          ctx.emit('collect');
          info(getResultMessage(data?.collectFromFolder ?? {}));
        }
      } finally {
        loadingCount.value -= 1;
      }
    };

    ctx.root.$on('collect', async (cb?: () => void) => {
      await collect();
      cb?.();
    });

    return {
      formData,
      originPrefix,
      showStats,
      isHistoryStateChanged,
      archiveURL,
      isCellOverlayVisible,
      collect,
      originPrefixInput,
      form,
      loadingCount,
    };
  },
});
</script>
