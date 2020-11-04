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
    button.form-button(
      class="w-full px-0 bg-red-500 inline-flex flex-center"
      @click="submit()"
    ) 
      FaIcon.mx-1(name="trash")
      span 确定删除
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import client from '@/client';

@Component<CGTeamworkNoteDeleteForm>({})
export default class CGTeamworkNoteDeleteForm extends Vue {
  @Prop({ type: String, required: true })
  id!: string;

  formData = {
    username: '',
    password: '',
  };

  async submit(): Promise<void> {
    await client.collection.deleteCGTeamworkNote({
      input: {
        id: [this.id],
        username: this.formData.username,
        password: this.formData.password,
      },
    });
    this.$emit('submit');
  }
}
</script>
