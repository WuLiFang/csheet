<template lang="pug">
  Drawer.cgteamwork-note-form-drawer(
    :visible.sync="$_visible"
    v-on="$listeners"
    @after-enter="() => $refs.form.focus()"
  )
    header(
      class="flex items-center"
    )
      button.form-button(
        type="button"
        @click="$_visible = false"
      )
        FaIcon(name="arrow-left")
      h1.inline-block(
        class="text-lg sm:text-xl font-semibold mx-2"
      ) 删除 CGTeamwork 备注
    CGTeamworkNoteDeleteForm(
      ref="form"
      class="my-2"
      v-bind="$attrs"
      @submit="$_visible = false; $emit('submit');"
    )
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { ModalMixin } from '@/mixins/ModalMixin';
import CGTeamworkNoteDeleteForm from '@/components/cgteamwork/CGTeamworkNoteDeleteForm.vue';
import 'vue-awesome/icons/arrow-left';

@Component<CGTeamworkNoteDeleteFormDrawer>({
  inheritAttrs: false,
  components: {
    CGTeamworkNoteDeleteForm,
  },
})
export default class CGTeamworkNoteDeleteFormDrawer extends Mixins(ModalMixin) {}
</script>
