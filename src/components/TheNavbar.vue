<template lang="pug">
  nav#navbar(
    @submit.prevent
  )
    label(
      class="mr-1 lg:mr-2 inline-flex items-center"
    )
      span(
          class="lg:mr-1"
      ) 模式
      Radio(
        v-model="formData.mode"
        label-class="text-sm block"
        :options=`[
        {
          key: 'cgteamwork',
          value: 'cgteamwork',
          disabled: !config.enableCGTeamwork,
          label: 'CGTeamwork',
        },
        {
          key: 'folder',
          value: 'folder',
          label: '文件夹',
        },
        ]`
      )
    template(v-if="formData.mode == 'cgteamwork'")
      span(
        class="mr-1 lg:mr-2 inline-block"
      )
        label(
          class="lg:mr-1"
          @click="() => $refs.cgteamworkProjectSelect.focus()"
        ) 项目
        CGTeamworkProjectSelect(
          ref="cgteamworkProjectSelect"
          v-model="formData.cgteamwork.database"
          @change="formData.cgteamwork.prefix = ''"
          required
        )
      span(
        class="mr-1 lg:mr-2 inline-flex items-center"
      )
        label(
          class="lg:mr-1"
          @click="() => $refs.cgteamworkPipelineSelect.focus()"
        ) 流程
        CGTeamworkPipelineSelect(
          ref="cgteamworkPipelineSelect"
          v-model="formData.cgteamwork.pipeline"
          :database="formData.cgteamwork.database"
          required
          clearable
          null-value=""
          @clear="formData.cgteamwork.pipeline = ''; formData.cgteamwork.prefix = '';"
        )
      label(
        class="mr-1 lg:mr-2 inline-block"
      )
        span(
          class="lg:mr-1"
        ) 前缀
        datalist#navbar-cgteamwork-prefix
          option(
            v-for="i in recentCGTeamworkPrefix"
          ) {{i}}
        input(
          ref="cgteamworkPrefixInput"
          v-model="formData.cgteamwork.prefix"
          class="form-input"
          @keydown.enter="collectFromCGTeamwork()"
          @input="$event.target.setCustomValidity('')"
          list="navbar-cgteamwork-prefix"
        )
    template(v-else-if="formData.mode == 'folder'")
      label(
        class="mr-1 lg:mr-2"
      )
        span(
          class="lg:mr-1"
        ) 路径
        datalist#navbar-folder-root
          option(
            v-for="i in recentFolderRoot"
          ) {{i}}
        input(
          v-model="formData.folder.root"
          class="form-input"
          required
          @keydown.enter="collectFromFolder()"
          list="navbar-folder-root"
        )
    button.form-button(
      ref="collectButton"
      class="mr-1 w-24"
      type="button"
      :disabled="loadingCount > 0"
      @click="collect()"
    )
      template(v-if="loadingCount > 0 ")
        FaIcon(name='spinner' spin)
      template(v-else)
        | 收集
    label
      input(
        type="checkbox"
        v-model="formData.skipEmptyPresentation"
        class="form-checkbox text-gray-900"
      )
      span.mx-1 跳过无内容
    label
      input(
        type="checkbox"
        v-model="cellOverlayVisible"
        class="form-checkbox text-gray-900"
      )
      span.mx-1 信息显示
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import {
  collectFromCGTeamworkVariables,
  collectFromCGTeamwork,
} from '../graphql/types/collectFromCGTeamwork';
import CGTeamworkProjectSelect from './cgteamwork/CGTeamworkProjectSelect.vue';
import {
  collectFromFolderVariables,
  collectFromFolder,
} from '../graphql/types/collectFromFolder';
import {
  folderOriginPrefixVariables,
  folderOriginPrefix,
} from '../graphql/types/folderOriginPrefix';
import {
  CollectFromCGTeamworkInput,
  CollectFromFolderInput,
} from '@/graphql/types/global';
import { collectionsVariables } from '../graphql/types/collections';
import db from '@/db';
import client, { CGTeamworkOriginPrefix, FolderOriginPrefix } from '../client';
import { uniq } from 'lodash';
import { info } from '@/message';
import { clientConfig_clientConfig as Config } from '@/graphql/types/clientConfig';
import CGTeamworkPipelineSelect from '@/components/cgteamwork/CGTeamworkPipelineSelect.vue';

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
    CGTeamworkProjectSelect,
    CGTeamworkPipelineSelect,
  },
  apollo: {
    folderOriginPrefix: {
      query: require('@/graphql/queries/folderOriginPrefix.gql'),
      variables(): folderOriginPrefixVariables {
        return { root: this.formData.folder.root };
      },
      update(v: folderOriginPrefix): string {
        return v.folderOriginPrefix;
      },
      skip(): boolean {
        return this.formData.mode !== 'folder';
      },
    },
  },
  async mounted() {
    const config = await client.config.get();
    if (config) {
      this.config = config;
      if (this.config.enableCGTeamwork) {
        this.formData.mode = 'cgteamwork';
      }
    }

    this.loadState();
    this.$watch(
      () => this.title,
      function(v) {
        document.title = v;
      }
    );
    this.$watch(
      () => [this.formData.mode, this.formData.cgteamwork.database],
      () => {
        this.isHistoryStateChanged = true;
      }
    );
    const popstateListener = () => {
      this.loadState();
    };
    window.addEventListener('popstate', popstateListener);
    this.$once('destoryed', () =>
      window.removeEventListener('popstate', popstateListener)
    );

    this.$watch(
      () => this.variables,
      v => {
        this.$emit('update:variables', v);
      },
      { immediate: true }
    );
  },
  destroyed() {
    this.$emit('destoryed');
  },
})
export default class TheNavbar extends Vue {
  formData: {
    mode: 'cgteamwork' | 'folder';
    folder: CollectFromFolderInput;
    cgteamwork: CollectFromCGTeamworkInput;
    skipEmptyPresentation: boolean;
  } = {
    mode: 'folder',
    folder: {
      root: '',
    },
    cgteamwork: {
      database: '',
      pipeline: '',
      prefix: '',
    },
    skipEmptyPresentation: false,
  };

  config: Omit<Config, '__typename'> = {
    sentryDSN: null,
    issueTrackerURL: null,
    enableCGTeamwork: false,
    folderInclude: [],
  };

  loadingCount = 0;
  $el!: HTMLFormElement;
  $refs!: {
    cgteamworkPrefixInput: HTMLInputElement;
    cgteamworkProjectSelect: CGTeamworkProjectSelect;
    cgteamworkPipelineSelect: CGTeamworkPipelineSelect;
    collectButton: HTMLButtonElement;
  };

  folderOriginPrefix = 'folder:';
  isHistoryStateChanged = false;

  get title(): string {
    const parts: string[] = [];
    switch (this.formData.mode) {
      case 'cgteamwork':
        parts.push(
          this.formData.cgteamwork.prefix,
          (this.$refs?.cgteamworkProjectSelect?.projects ?? []).find(
            i => i.database === this.formData.cgteamwork.database
          )?.name ?? this.formData.cgteamwork.database,
          this.formData.cgteamwork.pipeline
        );
        break;
      case 'folder':
        parts.push(this.formData.folder.root);
        break;
    }
    parts.push('色板');
    return parts.filter(i => !!i).join(' - ');
  }

  get cellOverlayVisible(): boolean {
    return db.preference.get('cellOverlayVisible');
  }

  set cellOverlayVisible(v: boolean) {
    db.preference.set('cellOverlayVisible', v);
  }

  get variables(): collectionsVariables {
    return {
      originPrefix: this.originPrefix,
      presentationCountGt: this.formData.skipEmptyPresentation ? 0 : undefined,
    };
  }

  @Watch('formData', { deep: true })
  saveState(): void {
    const u = new URL(location.href);
    u.search = '';
    u.searchParams.set('mode', this.formData.mode);
    if (this.formData.skipEmptyPresentation) {
      u.searchParams.set('skip_empty', '1');
    }
    switch (this.formData.mode) {
      case 'cgteamwork':
        u.searchParams.set('db', this.formData.cgteamwork.database);
        u.searchParams.set('pipeline', this.formData.cgteamwork.pipeline);
        u.searchParams.set('prefix', this.formData.cgteamwork.prefix);
        break;
      case 'folder':
        u.searchParams.set('root', this.formData.folder.root);
        break;
    }
    const title = document.title;
    const url = u.toString();
    if (url === location.href) {
      return;
    }
    if (this.isHistoryStateChanged) {
      history.pushState(null, title, url);
    } else {
      history.replaceState(null, title, url);
    }
    this.isHistoryStateChanged = false;
  }

  loadState(): void {
    const q = new URLSearchParams(location.search);
    switch (q.get('mode')) {
      case 'cgteamwork':
        this.formData.mode = 'cgteamwork';
        this.formData.cgteamwork.database = q.get('db') ?? '';
        this.formData.cgteamwork.pipeline = q.get('pipeline') ?? '';
        this.formData.cgteamwork.prefix = q.get('prefix') ?? '';
        break;
      case 'folder':
        this.formData.mode = 'folder';
        this.formData.folder.root = q.get('root') ?? '';
        break;
      default: {
        const latest = db.recentOriginPrefix.get()[0];
        if (latest instanceof CGTeamworkOriginPrefix) {
          this.formData.mode = 'cgteamwork';
          this.formData.cgteamwork.database = latest.database;
          this.formData.cgteamwork.pipeline = latest.pipeline;
          this.formData.cgteamwork.prefix = latest.prefix;
        } else if (latest instanceof FolderOriginPrefix) {
          this.formData.mode = 'folder';
          this.formData.folder.root = latest.root;
        }
      }
    }
    if (q.get('skip_empty')) {
      this.formData.skipEmptyPresentation = true;
    }
  }

  async collectFromCGTeamwork(): Promise<void> {
    if (!this.$el.reportValidity()) {
      return;
    }
    this.loadingCount += 1;
    try {
      const { data, errors } = await this.$apollo.mutate<
        collectFromCGTeamwork,
        collectFromCGTeamworkVariables
      >({
        mutation: require('@/graphql/mutations/collectFromCGTeamwork.gql'),
        variables: { input: this.formData.cgteamwork },
        errorPolicy: 'all',
      });
      for (const err of errors ?? []) {
        switch (err.extensions?.code) {
          case 'CGTEAMWORK_COLLECT_OVER_TASK_LIMIT':
            this.$refs.cgteamworkPrefixInput?.setCustomValidity(
              '请使用更精确的前缀匹配来匹配更少的任务，如一集或一场。'
            );
            break;
          default:
            throw err;
        }
        this.$el.reportValidity();
        return;
      }
      this.$emit('collect');
      info(getResultMessage(data?.collectFromCGTeamwork ?? {}));
    } finally {
      this.loadingCount -= 1;
    }
  }

  async collectFromFolder(): Promise<void> {
    if (!this.$el.reportValidity()) {
      return;
    }
    this.loadingCount += 1;
    try {
      const { data } = await this.$apollo.mutate<
        collectFromFolder,
        collectFromFolderVariables
      >({
        mutation: require('@/graphql/mutations/collectFromFolder.gql'),
        variables: { input: this.formData.folder },
      });
      this.$emit('collect');
      info(getResultMessage(data?.collectFromFolder ?? {}));
    } finally {
      this.loadingCount -= 1;
    }
  }

  async collect(): Promise<void> {
    this.isHistoryStateChanged = true;
    switch (this.formData.mode) {
      case 'cgteamwork':
        await this.collectFromCGTeamwork();
        break;
      case 'folder':
        await this.collectFromFolder();
        break;
    }
  }

  get originPrefix(): string {
    let ret = '';
    switch (this.formData.mode) {
      case 'cgteamwork':
        ret = `cgteamwork:${this.formData.cgteamwork.database}:${this.formData.cgteamwork.pipeline}:${this.formData.cgteamwork.prefix}`;
        ret = ret.replace(/:+$/, ':');
        break;
      case 'folder':
        ret = this.folderOriginPrefix;
        break;
    }
    return ret;
  }

  get recentFolderRoot(): string[] {
    return uniq([
      ...db.recentOriginPrefix
        .get()
        .filter((i): i is FolderOriginPrefix => i instanceof FolderOriginPrefix)
        .filter(i => i.root !== this.formData.folder.root)
        .map(i => i.root),
      ...(this.config.folderInclude ?? []),
    ]);
  }

  get recentCGTeamworkPrefix(): string[] {
    return uniq(
      db.recentOriginPrefix
        .get()
        .filter(
          (i): i is CGTeamworkOriginPrefix =>
            i instanceof CGTeamworkOriginPrefix
        )
        .filter(
          i =>
            i.database === this.formData.cgteamwork.database &&
            i.prefix !== this.formData.cgteamwork.prefix
        )
        .map(i => i.prefix)
    );
  }
}
</script>
