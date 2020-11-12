<template lang="pug">
  form(
    action="javascript:void(0)"
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
    label.block(
      class="m-1"
    )
      span.inline-block.w-16 阶段
      CGTeamworkStageSelect(v-model="formData.stage")
    label.block(
      class="m-1"
    )
      span.inline-block.w-16 流程
      RadioOrSelect(
        v-model="formData.pipeline"
        :options="pipelines.map(i => ({value: i, label: i}))"
      )
    CGTeamworkMessageEditor(
      class="mb-2"
      ref="messageEditor"
      v-model="formData.message"
    )
    fieldset
      button.form-button(
        class="w-1/3 px-0"
        type="button"
        @click="formData.status = 'Close'; submit()"
      ) 关闭
      button.form-button(
        class="w-1/3 px-0"
        class="bg-red-600 hover:bg-red-500"
        type="button"
        @click="formData.status = 'Retake'; submit()"
      ) 返修
      button.form-button(
        class="w-1/3 px-0"
        class="bg-green-600 hover:bg-green-500"
        type="button"
        @click="formData.status = 'Approve'; submit()"
      ) 通过
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import db from '@/db';
import client from '@/client';
import { Collection } from '@/graphql/types/Collection';
import { filePathFormat } from '@/const';
import {
  collectionNodeVariables,
  collectionNode,
} from '@/graphql/types/collectionNode';
import getCollectionPipelines from '@/client/utils/getCollectionPipelines';
import CGTeamworkStageSelect from '@/components/cgteamwork/CGTeamworkStageSelect.vue';
import CGTeamworkMessageEditor from '@/components/cgteamwork/CGTeamworkMessageEditor.vue';

@Component<CGTeamworkFlowForm>({
  components: {
    CGTeamworkStageSelect,
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
    stage: db.preference.get('cgteamworkStage'),
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
  };

  get pipelines(): string[] {
    return getCollectionPipelines(this.collection);
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
    } else {
      this.$refs.messageEditor.focus();
    }
  }
}
</script>
