<template lang="pug">
  nav#navbar
    form(
      ref="form"
      action="javascript:void(0)"
      @submit="collect()"
    )
      div(
        class="mr-1 lg:mr-2 inline-block"
      )
        OriginPrefixInput(
          ref="originPrefixInput"
          class=""
          v-model="formData.originPrefix"
          @change:mode="isHistoryStateChanged = true"
          @change:cgteamwork:database="isHistoryStateChanged = true"
        )
        button.form-button(
          ref="collectButton"
          class="mr-1 w-24"
          type="submit"
          :disabled="loadingCount > 0"
        )
          template(v-if="loadingCount > 0 ")
            FaIcon(name='spinner' spin)
          template(v-else)
            | 收集
      div.inline-block.mr-1.space-x-1
        span.mr-1 筛选
        CollectionTagInput(
          v-model="formData.tagOr" multiple input-class="w-32" placeholder="匹配任一标签" clearable
          class="max-w-md"
        )
        CollectionTagInput(
          v-model="formData.tagAnd" multiple input-class="w-32" placeholder="匹配全部标签" clearable
          class="max-w-md"
        )
        label(
          class="inline-block keep-all"
        )
          input(
            type="checkbox"
            v-model="formData.skipEmptyPresentation"
            class="form-checkbox text-gray-900"
          )
          span.mx-1 跳过无内容
      label(
        class="inline-block keep-all"
      )
        input(
          type="checkbox"
          v-model="cellOverlayVisible"
          class="form-checkbox text-gray-900"
        )
        span.mx-1 信息显示
      button.form-button(
        class="ml-1"
        type="button"
        title="统计"
        @click="showStats()"
      )
        FaIcon(name="chart-pie")
      a(
        download
        :href="archiveURL"
      )
        button.form-button(
          class="ml-1"
          type="button"
          title="归档打包"
        )
          FaIcon(name="archive")
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
import db from '@/db';
import mutations from '@/graphql/mutations';
import queries from '@/graphql/queries';
import { info } from '@/message';
import { show } from '@/modal';
import searchParamsSetAll from '@/utils/searchParamSetAll';
import {
  computed,
  onUnmounted,
  reactive,
  ref,
  watch,
} from '@vue/composition-api';
import 'vue-awesome/icons/chart-pie';
import 'vue-awesome/icons/archive';
import { Component, Vue } from 'vue-property-decorator';
import {
  collectFromFolder,
  collectFromFolderVariables,
} from '../graphql/types/collectFromFolder';
import { collectionsVariables } from '../graphql/types/collections';
import { filePathFormat } from '@/const';

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
  return `更新了 ${updatedCount} 个收藏`;
}

@Component<TheNavbar>({
  components: {
    OriginPrefixInput,
    CollectionTagInput,
  },
  setup: (props, ctx) => {
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

    const loadState = () => {
      const q = new URLSearchParams(location.search);
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
    };
    loadState();
    window.addEventListener('popstate', loadState);
    onUnmounted(() => window.removeEventListener('popstate', loadState));

    const saveState = async () => {
      const u = new URL(location.href);
      u.search = '';
      const originPrefix = OriginPrefix.parse(formData.originPrefix);
      if (originPrefix instanceof CGTeamworkOriginPrefix) {
        u.searchParams.set('mode', 'cgteamwork');
        u.searchParams.set('db', originPrefix.database);
        u.searchParams.set('pipeline', originPrefix.pipeline);
        u.searchParams.set('prefix', originPrefix.prefix);
      } else if (originPrefix instanceof FolderOriginPrefix) {
        u.searchParams.set('mode', 'folder');
        u.searchParams.set('root', originPrefix.root);
      }
      if (formData.skipEmptyPresentation) {
        u.searchParams.set('skip_empty', '1');
      }
      searchParamsSetAll(u.searchParams, 'tagOr', formData.tagOr);
      searchParamsSetAll(u.searchParams, 'tagAnd', formData.tagAnd);

      const url = u.toString();
      if (url === location.href) {
        return;
      }

      const parts: string[] = [];
      if (originPrefix instanceof CGTeamworkOriginPrefix) {
        const project =
          (
            await queries.cgteamworkProjects({
              database: [originPrefix.database],
            })
          ).data.cgteamworkProjects?.[0]?.name ?? originPrefix.database;
        parts.push(originPrefix.prefix, project, originPrefix.pipeline);
      }
      if (originPrefix instanceof FolderOriginPrefix) {
        parts.push(originPrefix.root);
      }
      parts.push('色板');
      document.title = parts.filter((i) => !!i).join(' - ');
      if (isHistoryStateChanged.value) {
        history.pushState(null, document.title, url);
      } else {
        history.replaceState(null, document.title, url);
      }
      isHistoryStateChanged.value = false;
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
          defaultVariables: variables.value,
        },
      });
    };

    const archiveURL = computed(() => {
      const u = new URL(location.href);
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
      u.searchParams.set('title', document.title);
      if (filePathFormat) {
        u.searchParams.set('file_path_format', filePathFormat);
      }
      return u;
    });

    return {
      formData,
      originPrefix,
      showStats,
      isHistoryStateChanged,
      archiveURL,
    };
  },
})
export default class TheNavbar extends Vue {
  formData!: {
    originPrefix: string;
    skipEmptyPresentation: boolean;
    tagOr: string[];
    tagAnd: string[];
  };

  loadingCount = 0;
  $refs!: {
    form: HTMLFormElement;
    originPrefixInput: InstanceType<typeof OriginPrefixInput>;
    collectButton: HTMLButtonElement;
  };

  originPrefix?: OriginPrefix;

  isHistoryStateChanged!: boolean;

  get cellOverlayVisible(): boolean {
    return db.preference.get('cellOverlayVisible');
  }

  set cellOverlayVisible(v: boolean) {
    db.preference.set('cellOverlayVisible', v);
  }

  async collect(): Promise<void> {
    this.isHistoryStateChanged = true;
    if (this.loadingCount > 0) {
      return;
    }
    this.loadingCount += 1;
    try {
      if (this.originPrefix instanceof CGTeamworkOriginPrefix) {
        const { data, errors } = await mutations.collectFromCGTeamwork(
          {
            input: {
              database: this.originPrefix.database,
              prefix: this.originPrefix.prefix,
              pipeline: this.originPrefix.pipeline,
            },
          },
          { errorPolicy: 'all' }
        );
        for (const err of errors ?? []) {
          switch (err.extensions?.code) {
            case 'CGTEAMWORK_COLLECT_OVER_TASK_LIMIT':
              this.$refs.originPrefixInput?.cgteamworkPrefixInput?.setCustomValidity(
                '请使用更精确的前缀匹配来匹配更少的任务，如一集或一场。'
              );
              break;
            default:
              throw err;
          }
          this.$refs.form?.reportValidity();
          return;
        }
        this.$emit('collect');
        info(getResultMessage(data?.collectFromCGTeamwork ?? {}));
      } else if (this.originPrefix instanceof FolderOriginPrefix) {
        const { data } = await this.$apollo.mutate<
          collectFromFolder,
          collectFromFolderVariables
        >({
          mutation: require('@/graphql/mutations/collectFromFolder.gql'),
          variables: {
            input: {
              root: this.originPrefix.root,
            },
          },
        });
        this.$emit('collect');
        info(getResultMessage(data?.collectFromFolder ?? {}));
      }
    } finally {
      this.loadingCount -= 1;
    }
  }
}
</script>
