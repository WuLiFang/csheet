<template lang="pug">
  Drawer.cgteamwork-flow-form-drawer(
    :visible.sync="visible"
    @after-enter="() => $refs.form.focus()"
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
      ) 更改 CGTeamwork 流程状态
    CGTeamworkFlowForm(
      ref="form"
      class="my-2"
      v-bind="$attrs"
      @submit="visible = false"
    )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CGTeamworkFlowForm from './CGTeamworkFlowForm.vue';
import 'vue-awesome/icons/arrow-left';

@Component<CGTeamworkFlowFormDrawer>({
  inheritAttrs: false,
  components: {
    CGTeamworkFlowForm,
  },
})
export default class CGTeamworkFlowFormDrawer extends Vue {
  $refs!: {
    form: CGTeamworkFlowForm;
  };

  visible = true;
}
</script>
