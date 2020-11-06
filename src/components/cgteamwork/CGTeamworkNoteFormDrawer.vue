<template lang="pug">
  Drawer.cgteamwork-note-form-drawer(
    :visible.sync="visible"
    v-on="$listeners"
    @after-enter="() => $refs.form.focus()"
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
      ) 添加 CGTeamwork 备注
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
import 'vue-awesome/icons/arrow-left';

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
