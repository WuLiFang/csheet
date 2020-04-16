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
          v-model="formData.cgteamwork.database"
          class="form-select"
          required
        )
      label(
        class="mr-1 lg:mr-2 inline-block"
      )
        span(
          class="lg:mr-1"
        ) 流程
        datalist#navbar-cgteamwork-pipeline
          option 合成
          option 灯光
          option 动画
          option 特效
        input(
          v-model="formData.cgteamwork.pipeline"
          class="form-input"
          required
          list="navbar-cgteamwork-pipeline"
        )
      label(
        class="mr-1 lg:mr-2 inline-block"
      ) 
        span(
          class="lg:mr-1"
        ) 前缀
        input(
          v-model="formData.cgteamwork.prefix"
          required
          class="form-input"
          @keydown.enter="collectFromCGTeamwork()"
        )
    template(v-else-if="formData.mode == 'folder'")
      label(
        class="mr-1 lg:mr-2"
      ) 
        span(
          class="lg:mr-1"
        ) 路径
        input(
          v-model="formData.folder.root"
          class="form-input"
          required
          @keydown.enter="collectFromFolder()"
        )
    button(
      class="bg-gray-700 hover:bg-gray-600 p-2 w-16 rounded-sm"
      type="button"
      :disabled="loadingCount > 0"
      @click="collect()"
    ) 
      template(v-if="loadingCount > 0 ")
        FaIcon(name='spinner' spin)
      template(v-else)
        | 收集
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
import { VueApolloQueryDefinition } from 'vue-apollo/types/options';

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
        return this.formData.mode != 'folder';
      },
    },
  },
  mounted() {
    this.loadState();
  },
})
export default class TheNavbar extends Vue {
  formData: {
    mode: 'cgteamwork' | 'folder';
    folder: collectFromFolderVariables;
    cgteamwork: collectFromCGTeamworkVariables;
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
  };

  loadingCount = 0;
  $el!: HTMLFormElement;
  folderOriginPrefix = 'folder:';

  async collectFromCGTeamwork() {
    if (!this.$el.reportValidity()) {
      return;
    }
    this.loadingCount += 1;
    try {
      const { data } = await this.$apollo.mutate<collectFromCGTeamwork>({
        mutation: require('@/graphql/mutations/collectFromCGTeamwork.gql'),
        variables: this.formData.cgteamwork,
      });
      this.$emit('collect');
      this.$root.$emit(
        'app-message',
        `更新了 ${data?.collectFromCGTeamwork?.updatedCount} 个收藏`
      );
    } finally {
      this.loadingCount -= 1;
    }
  }
  async collectFromFolder() {
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
  async collect() {
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

  @Watch('formData', { deep: true })
  saveState() {
    const u = new URL(location.href);
    u.search = '';
    u.searchParams.set('mode', this.formData.mode);
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

  loadState() {
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
    }
  }

  @Watch('originPrefix')
  update(v: string) {
    return this.$emit('update:originPrefix', v);
  }

  showMessage() {
    this.$el.append(document.createElement('div'));
  }
}
</script>
