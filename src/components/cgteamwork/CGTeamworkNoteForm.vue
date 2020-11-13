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
      span.inline-block.w-16 流程
      SessionStorage(name="cgteamwork.note-pipeline" v-model="formData.pipeline")
        RadioOrSelect(
          v-model="formData.pipeline"
          :options="pipelines"
        )
    CGTeamworkMessageEditor(
      ref="messageEditor"
      v-model="formData.message"
      :required="formData.message.images.length === 0"
      class="mb-2"
    )
    button.form-button(
      class="w-full px-0"
      @click="submit()"
    ) 提交
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import getCollectionPipelines from '@/client/utils/getCollectionPipelines';
import { Collection } from '@/graphql/types/Collection';
import { filePathFormat } from '@/const';
import {
  collectionNodeVariables,
  collectionNode,
} from '@/graphql/types/collectionNode';
import CGTeamworkMessageEditor from '@/components/cgteamwork/CGTeamworkMessageEditor.vue';
import client from '@/client';

@Component<CGTeamworkNoteForm>({
  components: {
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
export default class CGTeamworkNoteForm extends Vue {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: Object })
  default?: Partial<CGTeamworkNoteForm['formData']>;

  collection?: Collection;

  $el!: HTMLFormElement;

  $refs!: {
    usernameInput: HTMLInputElement;
    passwardInput: HTMLInputElement;
    messageEditor: CGTeamworkMessageEditor;
  };

  formData = {
    username: '',
    password: '',
    pipeline: '',
    message: {
      html: '',
      images: [] as (Blob | File)[],
    },
  };

  get pipelines(): string[] {
    return getCollectionPipelines(this.collection);
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

  async submit(): Promise<void> {
    if (!this.$el.reportValidity()) {
      return;
    }
    const id = this.id;
    await client.collection.createCGTeamworkNote({
      input: {
        username: this.formData.username,
        password: this.formData.password,
        data: [
          {
            id: this.id,
            html: this.formData.message.html,
            pipeline: this.formData.pipeline,
            images: this.formData.message.images,
          },
        ],
      },
    });
    this.$root.$emit('refetch:cgteamwork-note', id);
    this.$emit('submit');
  }
}
</script>
