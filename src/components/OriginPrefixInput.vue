<template>
  <div class="inline-flex items-center justify-center flex-wrap">
    <span class="lg:mr-1">模式</span>
    <Radio
      v-model="formData.mode"
      label-class="text-sm block"
      :options="[
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
      ]"
    ></Radio>
    <template v-if="formData.mode == 'cgteamwork'"
      ><span class="mr-1 lg:mr-2 inline-block">
        <label
          class="lg:mr-1"
          @click="() =&gt; $refs.cgteamworkProjectSelect.focus()"
          >项目</label
        >
        <CGTeamworkProjectSelect
          ref="cgteamworkProjectSelect"
          v-model="formData.cgteamwork.database"
          required
          @change="formData.cgteamwork.prefix = ''"
        ></CGTeamworkProjectSelect></span
      ><span class="mr-1 lg:mr-2 inline-flex items-center">
        <label
          class="lg:mr-1"
          @click="() =&gt; $refs.cgteamworkPipelineSelect.focus()"
          >流程</label
        >
        <CGTeamworkPipelineRadio
          ref="cgteamworkPipelineSelect"
          v-model="formData.cgteamwork.pipeline"
          :database="formData.cgteamwork.database"
          required
          clearable
          null-value=""
          @clear="
            formData.cgteamwork.pipeline = '';
            formData.cgteamwork.prefix = '';
          "
        ></CGTeamworkPipelineRadio
      ></span>
      <label class="mr-1 lg:mr-2 inline-block"
        ><span class="lg:mr-1">前缀</span>
        <datalist :id="idPrefix + 'cgteamwork-prefix'">
          <option v-for="i in recentCGTeamworkPrefix" :key="i">{{ i }}</option>
        </datalist>
        <input
          ref="cgteamworkPrefixInput"
          v-model="formData.cgteamwork.prefix"
          class="form-input"
          :list="idPrefix + 'cgteamwork-prefix'"
          @input="$event.target.setCustomValidity('')"
        />
      </label>
    </template>
    <template v-else-if="formData.mode == 'folder'">
      <label class="mr-1 lg:mr-2"
        ><span class="lg:mr-1">路径</span>
        <datalist :id="idPrefix + 'folder-root'">
          <option v-for="i in recentFolderRoot" :key="i">{{ i }}</option>
        </datalist>
        <input
          v-model="formData.folder.root"
          class="form-input"
          required
          :list="idPrefix + 'folder-root'"
        />
      </label>
    </template>
  </div>
</template>

<script lang="ts">
import client, { CGTeamworkOriginPrefix, FolderOriginPrefix } from '@/client';
import CGTeamworkPipelineRadio from '@/components/cgteamwork/CGTeamworkPipelineRadio.vue';
import CGTeamworkProjectSelect from '@/components/cgteamwork/CGTeamworkProjectSelect.vue';
import { filePathFormat } from '@/const';
import db from '@/db';
import queries from '@/graphql/queries';
import {
  computed,
  defineComponent,
  reactive,
  ref,
  watch,
} from '@vue/composition-api';
import { uniq, uniqueId, debounce } from 'lodash';

export default defineComponent({
  name: 'OriginPrefixInput',
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  components: {
    CGTeamworkProjectSelect,
    CGTeamworkPipelineRadio,
  },
  setup: (props, ctx) => {
    const { config } = queries.useClientConfig(
      computed(() => ({ filePathFormat }))
    );
    const cgteamworkPrefixInput = ref<HTMLInputElement | undefined>();
    const formData = reactive({
      mode: 'folder' as 'cgteamwork' | 'folder',
      folder: {
        root: '',
      },
      cgteamwork: {
        database: '',
        pipeline: '',
        prefix: '',
      },
    });

    const loadValue = (v: string) => {
      const p = client.OriginPrefix.parse(v);
      if (p instanceof client.FolderOriginPrefix) {
        formData.mode = 'folder';
        formData.folder.root = p.root;
      } else if (p instanceof client.CGTeamworkOriginPrefix) {
        formData.mode = 'cgteamwork';
        formData.cgteamwork.database = p.database;
        formData.cgteamwork.pipeline = p.pipeline;
        formData.cgteamwork.prefix = p.prefix;
      }
    };
    watch(
      () => props.value,
      (n) => {
        loadValue(n);
      },
      { immediate: true }
    );

    const recentFolderRoot = computed(() => {
      return uniq([
        ...db.recentOriginPrefix
          .get()
          .filter(
            (i): i is FolderOriginPrefix => i instanceof FolderOriginPrefix
          )
          .filter((i) => i.root !== formData.folder.root)
          .map((i) => i.root),
        ...(config.value.folderInclude ?? []),
      ]);
    });
    const { data: folderOriginPrefixData } = queries.useFolderOriginPrefix(
      computed(() => ({
        root: formData.folder.root,
      }))
    );
    watch(
      () => formData.mode,
      () => {
        ctx.emit('change:mode');
      }
    );

    const recentCGTeamworkPrefix = computed(() => {
      return uniq(
        db.recentOriginPrefix
          .get()
          .filter(
            (i): i is CGTeamworkOriginPrefix =>
              i instanceof CGTeamworkOriginPrefix
          )
          .filter(
            (i) =>
              i.database === formData.cgteamwork.database &&
              i.prefix !== formData.cgteamwork.prefix
          )
          .map((i) => i.prefix)
      );
    });
    watch(
      () => formData.cgteamwork.database,
      () => {
        ctx.emit('change:cgteamwork:database');
      }
    );
    const originPrefix = computed(() => {
      let ret = '';
      switch (formData.mode) {
        case 'cgteamwork':
          ret = new client.CGTeamworkOriginPrefix(
            formData.cgteamwork.database,
            formData.cgteamwork.pipeline,
            formData.cgteamwork.prefix
          ).toString();
          break;
        case 'folder':
          ret = folderOriginPrefixData.value?.folderOriginPrefix ?? '';
          break;
      }
      return ret;
    });
    watch(
      originPrefix,
      debounce((n: string) => {
        if (props.value !== n) {
          ctx.emit('input', n);
        }
      })
    );

    const idPrefix = uniqueId('origin-prefix-input-') + '-';

    return {
      idPrefix,
      config,
      formData,
      recentFolderRoot,
      recentCGTeamworkPrefix,
      cgteamworkPrefixInput,
    };
  },
});
</script>
