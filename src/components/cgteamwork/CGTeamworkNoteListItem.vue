<template lang="pug">
  li.block
    .block
      span.inline-block(
        class="w-1/4"
      ).artist {{value.createdByName}}
      span(
        v-show="!hidePipeline"
        class="mx-1"
      ) {{value.pipeline}}
      CGTeamworkTaskStatus.inline-block(
        class="px-1 m-1 rounded-sm w-24 text-center"
        :value="value.type"
      )
      TimeWidget.inline-block(
        class="mx-1 text-gray-500"
        :value="value.created"
      )
      button.form-button(
        type="button"
        class="float-right m-1 p-0 h-6 w-12 inline-flex flex-center"
        @click="showDeleteFormDrawer()"
        title="删除备注"
      )
        FaIcon.h-4(name="trash")
    .ml-2.clear-both(
      class="overflow-hidden"
    )
      p(class="mx-1" v-html="safeHTML")
      template(v-for="i in value.message.images")
        img.inline-block(
          :src="i.min.url"
          class="cursor-zoom-in"
          class="m-1 h-16"
          @click="showImageViewer(i.max.url)"
        )
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import CGTeamworkTaskStatus from './CGTeamworkTaskStatus.vue';
import DOMPurify from 'dompurify';
import { show } from '@/modal';
import 'vue-awesome/icons/trash';
import CGTeamworkNoteDeleteFormDrawer from '@/components/cgteamwork/CGTeamworkNoteDeleteFormDrawer.vue';
import ImageViewer from '@/components/ImageViewer.vue';

export interface CGTeamworkNoteListItemValue {
  id: string;
  pipeline: string;
  type: string;
  created: Date;
  createdByName: string;
  message: {
    html: string;
    images: { max: { url: string }; min: { url: string } }[];
  };
}

@Component<CGTeamworkNoteListItem>({
  components: {
    CGTeamworkTaskStatus,
  },
})
export default class CGTeamworkNoteListItem extends Vue {
  @Prop({ required: true, type: Object })
  value!: CGTeamworkNoteListItemValue;

  @Prop({ type: Boolean, default: false })
  hidePipeline!: boolean;

  get safeHTML(): string {
    return DOMPurify.sanitize(this.value.message.html, {
      FORBID_ATTR: ["class", "style"]
    });
  }

  showDeleteFormDrawer(): void {
    show(CGTeamworkNoteDeleteFormDrawer, {
      attrs: { id: this.value.id },
      on: {
        submit: () => {
          this.$emit('delete');
        },
      },
    });
  }

  showImageViewer(src: string): void {
    show(ImageViewer, { attrs: { src } });
  }
}
</script>
