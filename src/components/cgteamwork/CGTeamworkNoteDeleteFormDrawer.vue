<template lang="pug">
  Drawer.cgteamwork-note-form-drawer(
    :visible.sync="visible"
    v-on="$listeners"
  )
    template(#title) 删除 CGTeamwork 备注
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
