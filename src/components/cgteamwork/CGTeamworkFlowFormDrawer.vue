<template lang="pug">
  .cgteamwork-flow-form-drawer(
    class="fixed inset-0 z-20 flex flex-col overflow-hidden"
  )
    transition(
      enter-class="opacity-0"
      leave-to-class="opacity-0"
      enter-active-class="transition-all duration-300 ease-in-out"
      leave-active-class="transition-all duration-300 ease-in-out"
    )
      .overlay(
        class="z-0 absolute inset-0 bg-black bg-opacity-50"
        @click="close()"
        v-if="visible"
      )
    transition(
      enter-class="transform translate-x-full"
      leave-to-class="transform translate-x-full"
      enter-active-class="transition-all duration-300 ease-in-out"
      leave-active-class="transition-all duration-300 ease-in-out"
      @after-leave="$emit('close')"
      @after-enter="() => $refs.form.focus()"
    )
      .container(
        class="z-10 absolute m-auto bg-gray-800 h-screen max-w-lg right-0"
        class="sm:p-4"
        v-if="visible"
      )
        header(
          class="flex items-center"
        )
          button.form-button(
            type="button"
            @click="close()"
          )
            FaIcon(name="arrow-left")
          h1.inline-block(
            class="text-lg sm:text-xl font-semibold mx-2"
          ) 更改 CGTeamwork 流程状态
        CGTeamworkFlowForm(
          ref="form"
          class="my-2"
          :id="id"
          :default=`{
            pipeline,
            stage
          }`
          @submit="close()"
        )
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { ModalMixin } from '@/mixins/ModalMixin';
import CGTeamworkFlowForm from './CGTeamworkFlowForm.vue';
import 'vue-awesome/icons/arrow-left';

@Component<CGTeamworkFlowFormDrawer>({
  components: {
    CGTeamworkFlowForm,
  },
})
export default class CGTeamworkFlowFormDrawer extends Mixins(ModalMixin) {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: String })
  pipeline?: string;

  @Prop({ type: String })
  stage?: string;

  $refs!: {
    form: CGTeamworkFlowForm;
  };

  close(): void {
    this.$_visible = false;
  }
}
</script>
