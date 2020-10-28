<template lang="pug">
  form(
    action="javascript:void(0)"
  )
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
      select.form-select(
        v-model="formData.stage"
        required
      )
        option(value="leader") 组长
        option(value="director") 导演
        option(value="client") 客户
    label.block(
      class="m-1"
    )
      span.inline-block.w-16 流程
      select.form-select(
        v-model="formData.pipeline"
        required
      )
        option(
          v-for="i in pipelines"
          :key="i"
          :value="i"
        ) {{ i }}
    label.block(
      class="m-1"
    )
      span 备注
      textarea.form-textarea(
        ref="noteTextarea"
        v-model="formData.note"
        class="w-full my-1"
      )
    fieldset
      button.form-button(
        class="w-1/3 px-0"
        type="button"
        @click="formData.status = 'Close'; submit()"
      ) 关闭
      button.form-button(
        class="w-1/3 px-0"
        class="bg-red-600"
        type="button"
        @click="formData.status = 'Retake'; submit()"
      ) 返修
      button.form-button(
        class="w-1/3 px-0"
        class="bg-green-600"
        type="button"
        @click="formData.status = 'Approve'; submit()"
      ) 通过
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import db from '@/db';
import client from '@/client';
import { collection as Collection } from '@/graphql/types/collection';
import { filePathFormat } from '@/const';
import {
  collectionNodeVariables,
  collectionNode,
} from '@/graphql/types/collectionNode';
import cast from 'cast-unknown';

@Component<CGTeamworkFlowForm>({
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
    this.formData.username =
      sessionStorage.getItem('cgteamwork.username') ?? '';
    this.formData.password =
      sessionStorage.getItem('cgteamwork.password') ?? '';
    this.$watch(
      () => this.formData.username,
      v => {
        sessionStorage.setItem('cgteamwork.username', v);
      }
    );
    this.$watch(
      () => this.formData.password,
      v => {
        sessionStorage.setItem('cgteamwork.password', v);
      }
    );
    this.$watch(
      () => this.collection,
      v => {
        this.formData.pipeline =
          (this.formData.pipeline ||
            v?.metadata.find(i => i.k === 'cgteamwork.pipeline')?.v) ??
          this.formData.pipeline;
        Object.assign(this.formData, this.default, this.formData);
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
    note: '',
    pipeline: '',
  };

  collection?: Collection;

  $el!: HTMLFormElement;

  $refs!: {
    usernameInput: HTMLInputElement;
    passwardInput: HTMLInputElement;
    noteTextarea: HTMLTextAreaElement;
  };

  get pipelines(): string[] {
    try {
      return cast
        .array(
          JSON.parse(
            this.collection?.metadata.find(i => i.k === 'cgteamwork.tasks')
              ?.v ?? ''
          )
        )
        .map(cast.object)
        .map(i => cast.string(i.pipeline));
    } catch {
      return [];
    }
  }

  async submit(): Promise<void> {
    if (!this.$el.reportValidity()) {
      return;
    }
    this.$el.submit();
    await client.collection.updateCGTeamworkFlow({
      input: {
        username: this.formData.username,
        password: this.formData.password,
        data: [
          {
            id: this.id,
            stage: this.formData.stage,
            status: this.formData.status,
            pipeline: this.formData.pipeline,
            note: this.formData.note || undefined,
          },
        ],
      },
    });
    this.$emit('submit');
    this.$root.$emit('app-message', '任务状态更新成功');
  }

  focus(): void {
    if (!this.formData.username) {
      this.$refs.usernameInput.focus();
    } else if (!this.formData.password) {
      this.$refs.passwardInput.focus();
    } else {
      this.$refs.noteTextarea.focus();
    }
  }
}
</script>
