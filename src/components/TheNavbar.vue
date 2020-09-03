<template lang="pug">
  form#navbar(
    @submit.prevent
  )
    label(
      class="mr-1 lg:mr-2 inline-block"
    )
      span(
          class="lg:mr-1"
      ) 模式
      select(
        v-model="formData.mode"
        class="form-select"
        type="select"
      )
        option(value="cgteamwork") CGTeamwork
        option(value="folder") 文件夹
    template(v-if="formData.mode == 'cgteamwork'")
      label(
        class="mr-1 lg:mr-2 inline-block"
      ) 
        span(
          class="lg:mr-1"
        ) 项目
        CGTeamworkProjectSelect(
          ref="cgteamworkProjectSelect"
          v-model="formData.cgteamwork.database"
          class="form-select"
          @change="formData.cgteamwork.prefix = ''"
          required
        )
      label(
        class="mr-1 lg:mr-2 inline-block"
      )
        span(
          class="lg:mr-1"
        ) 流程
        datalist#navbar-cgteamwork-pipeline
          option(
            v-for="i in recentCGTeamworkPipeline"
          ) {{i}}
        input(
          v-model="formData.cgteamwork.pipeline"
          class="form-input"
          placeholder="选择或输入"
          required
          list="navbar-cgteamwork-pipeline"
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
    button(
      ref="collectButton"
      class="bg-gray-700 hover:bg-gray-600 mr-1 p-2 w-16 rounded-sm"
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
import { collectionsVariables } from '../graphql/types/collections';
import * as preference from '@/preference';
import { db } from '../db';
import { CGTeamworkOriginPrefix, FolderOriginPrefix } from '../client';
import { uniq } from 'lodash';

@Component<TheNavbar>({
  components: {
    CGTeamworkProjectSelect,
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
  mounted() {
    this.loadState();
    this.$watch(
      () => this.title,
      function(v) {
        document.title = v;
      }
    );
  },
})
export default class TheNavbar extends Vue {
  formData: {
    mode: 'cgteamwork' | 'folder';
    folder: collectFromFolderVariables;
    cgteamwork: collectFromCGTeamworkVariables;
    skipEmptyPresentation: boolean;
  } = {
    mode: 'cgteamwork',
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

  loadingCount = 0;
  $el!: HTMLFormElement;
  $refs!: {
    cgteamworkPrefixInput: HTMLInputElement;
    cgteamworkProjectSelect: CGTeamworkProjectSelect;
    collectButton: HTMLButtonElement;
  };

  folderOriginPrefix = 'folder:';

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
    return preference.get('cellOverlayVisible');
  }

  set cellOverlayVisible(v: boolean) {
    preference.set('cellOverlayVisible', v);
  }

  get variables(): collectionsVariables {
    return {
      originPrefix: this.originPrefix,
      presentationCountGt: this.formData.skipEmptyPresentation ? 0 : undefined,
    };
  }

  @Watch('variables')
  setVariables(v: collectionsVariables): void {
    this.$emit('update:variables', v);
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
    history.replaceState(null, document.title, u.toString());
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
      const { data, errors } = await this.$apollo.mutate<collectFromCGTeamwork>(
        {
          mutation: require('@/graphql/mutations/collectFromCGTeamwork.gql'),
          variables: this.formData.cgteamwork,
          errorPolicy: 'all',
        }
      );
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
      this.$root.$emit(
        'app-message',
        `更新了 ${data?.collectFromCGTeamwork?.updatedCount} 个收藏`
      );
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
      const { data } = await this.$apollo.mutate<collectFromFolder>({
        mutation: require('@/graphql/mutations/collectFromFolder.gql'),
        variables: this.formData.folder,
      });
      this.$emit('collect');
      this.$root.$emit(
        'app-message',
        `更新了 ${data?.collectFromFolder?.updatedCount} 个收藏`
      );
    } finally {
      this.loadingCount -= 1;
    }
  }

  async collect(): Promise<void> {
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
    return uniq(
      db.recentOriginPrefix
        .get()
        .filter((i): i is FolderOriginPrefix => i instanceof FolderOriginPrefix)
        .filter(i => i.root !== this.formData.folder.root)
        .map(i => i.root)
    );
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

  get recentCGTeamworkPipeline(): string[] {
    return uniq(
      ['合成', '灯光', '动画', '特效', '场景细化'].concat(
        ...db.recentOriginPrefix
          .get()
          .filter(
            (i): i is CGTeamworkOriginPrefix =>
              i instanceof CGTeamworkOriginPrefix
          )
          .filter(i => i.pipeline !== this.formData.cgteamwork.pipeline)
          .map(i => i.pipeline)
      )
    );
  }
}
</script>
