<template lang="pug">
  Drawer.cgteamwork-note-form-drawer(
    :visible.sync="visible"
    v-on="$listeners"
    @after-enter="() => $refs.form.focus()"
  )
    template(#title) 添加 CGTeamwork 备注
    CGTeamworkNoteForm(
      ref="form"
      class="my-2"
      v-bind="$attrs"
      @submit="visible = false; $emit('submit');"
    )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CGTeamworkNoteForm from '@/components/cgteamwork/CGTeamworkNoteForm.vue';

@Component<CGTeamworkNoteFormDrawer>({
  inheritAttrs: false,
  components: {
    CGTeamworkNoteForm,
  },
})
export default class CGTeamworkNoteFormDrawer extends Vue {
  visible = true;
}
</script>
