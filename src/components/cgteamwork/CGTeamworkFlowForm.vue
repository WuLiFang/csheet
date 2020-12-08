<template lang="pug">
  form(
    action="javascript:void(0)"
    @submit="submit()"
  )
    SessionStorage(name="cgteamwork.username" v-model="formData.username")
      label.block(
        class="m-1"
      )
        span.inline-block.w-16 用户名
        input.form-input(
          ref="usernameInput"
          v-model="formData.username"
          autocomplete="username"
          required
        )
    SessionStorage(name="cgteamwork.password" v-model="formData.password")
      label.block(
        class="m-1"
      )
        span.inline-block.w-16 密码
        input.form-input(
          ref="passwardInput"
          v-model="formData.password"
          type="password"
          autocomplete="current-password"
          required
        )
    hr.border-gray-600.my-2
    .block(
      class="m-1"
    )
      span.inline-block.w-16 阶段
      CGTeamworkStageRadio(
        class="w-64"
        v-model="formData.stage"
        :variables="{ database, pipeline: [formData.pipeline] }"
        required
      )
    fieldset.block(
      class="m-1"
    )
      span.inline-block.w-16 流程
      Radio(
        v-model="formData.pipeline"
        :options="pipelines"
        required
        @change="formData.stage = ''; formData.status = '';"
      )
    fieldset.block(
      class="m-1"
    )
      span.inline-block.w-16 状态
      CGTeamworkStatusSelect(
        ref="statusSelect"
        class="w-64"
        v-model="formData.status"
        :stage="formData.stage"
        :variables="{ database, pipeline: [formData.pipeline] }"
        required
      )
    CGTeamworkMessageEditor(
      class="mb-2"
      ref="messageEditor"
      v-model="formData.message"
    )
    fieldset
      button.form-button(
        class="w-full"
        type="submit"
      ) 提交
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import client, { CGTeamworkOriginPrefix } from '@/client';
import { Collection } from '@/graphql/types/Collection';
import { filePathFormat } from '@/const';
import {
  collectionNodeVariables,
  collectionNode,
} from '@/graphql/types/collectionNode';
import getCollectionPipelines from '@/client/utils/getCollectionPipelines';
import CGTeamworkStageRadio from '@/components/cgteamwork/CGTeamworkStageRadio.vue';
import CGTeamworkStatusSelect from '@/components/cgteamwork/CGTeamworkStatusSelect.vue';
import CGTeamworkMessageEditor from '@/components/cgteamwork/CGTeamworkMessageEditor.vue';

@Component<CGTeamworkFlowForm>({
  components: {
    CGTeamworkStageRadio,
    CGTeamworkStatusSelect,
    CGTeamworkMessageEditor,
  },
  apollo: {
    collection: {
      query: require('@/graphql/queries/collectionNode.gql'),
      variables(): collectionNodeVariables {
        return { id: this.id, filePathFormat };
      },
      update(v: collectionNode): Collection | undefined {
        return v.node?.__typename === 'Collection' ? v.node : undefined;
      },
    },
  },
  mounted() {
    this.$watch(
      () => this.collection,
      v => {
        Object.assign(
          this.formData,
          {
            pipeline:
              (this.formData.pipeline ||
                v?.metadata.find(i => i.k === 'cgteamwork.pipeline')?.v) ??
              this.formData.pipeline,
          },
          this.default
        );
      },
      { immediate: true }
    );
  },
})
export default class CGTeamworkFlowForm extends Vue {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: Object })
  default?: Partial<CGTeamworkFlowForm['formData']>;

  formData = {
    username: '',
    password: '',
    stage: '',
    status: '',
    pipeline: '',
    message: {
      html: '',
      images: [] as (File | Blob)[],
    },
  };

  collection?: Collection;

  $el!: HTMLFormElement;

  $refs!: {
    usernameInput: HTMLInputElement;
    passwardInput: HTMLInputElement;
    messageEditor: CGTeamworkMessageEditor;
    statusSelect: CGTeamworkStatusSelect;
  };

  get pipelines(): string[] {
    return getCollectionPipelines(this.collection);
  }

  get database(): string {
    if (!this.collection) {
      return '';
    }
    return CGTeamworkOriginPrefix.parse(this.collection?.origin).database;
  }

  async submit(): Promise<void> {
    if (!this.$el.reportValidity()) {
      return;
    }
    this.$el.submit();
    const id = this.id;
    await client.collection.updateCGTeamworkFlow({
      input: {
        username: this.formData.username,
        password: this.formData.password,
        data: [
          {
            id,
            stage: this.formData.stage,
            status: this.formData.status,
            pipeline: this.formData.pipeline,
            note: this.formData.message.html,
            images: this.formData.message.images,
          },
        ],
      },
    });
    this.$emit('submit');
    this.$root.$emit('refetch:cgteamwork-note', id);
  }

  focus(): void {
    if (!this.formData.username) {
      this.$refs.usernameInput.focus();
    } else if (!this.formData.password) {
      this.$refs.passwardInput.focus();
    } else if (!this.formData.status) {
      this.$refs.statusSelect.focus();
    } else {
      this.$refs.messageEditor.focus();
    }
  }
}
</script>
