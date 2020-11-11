<template lang="pug">
  Drawer.cgteamwork-note-form-drawer(
    :visible.sync="visible"
    v-on="$listeners"
  )
    header(
      class="flex items-center"
    )
      button.form-button(
        type="button"
        @click="visible = false"
      )
        FaIcon(name="arrow-left")
      h1.inline-block(
        class="text-lg sm:text-xl font-semibold mx-2"
      ) 删除 CGTeamwork 备注
    CGTeamworkNoteDeleteForm(
      ref="form"
      class="my-2"
      v-bind="$attrs"
      @submit="visible = false; $emit('submit');"
    )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CGTeamworkNoteDeleteForm from '@/components/cgteamwork/CGTeamworkNoteDeleteForm.vue';
import 'vue-awesome/icons/arrow-left';

@Component<CGTeamworkNoteDeleteFormDrawer>({
  inheritAttrs: false,
  components: {
    CGTeamworkNoteDeleteForm,
  },
})
export default class CGTeamworkNoteDeleteFormDrawer extends Vue {
  visible = true
}
</script>
