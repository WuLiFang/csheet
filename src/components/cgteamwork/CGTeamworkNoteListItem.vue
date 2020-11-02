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
        class="px-1 m-1 rounded-sm w-12 text-center"
        :value="value.type"
      )
      TimeWidget.inline-block(
        class="mx-1 text-gray-500"
        :value="value.created"
      )
    .ml-4
      p(v-html="safeHTML")
      template(v-for="i in value.message.images")
        a.inline-block(
          target="_blank"
          :href="i.max.url"
        )
          img(:src="i.min.url"
            class="m-1 h-16"
          )
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import CGTeamworkTaskStatus from './CGTeamworkTaskStatus.vue';
import DOMPurify from "dompurify"

export interface CGTeamworkNoteListItemValue {
  pipeline: string;
  type: string;
  created: Date;
  createdByName: string;
  message: {
    text: string;
    images: { max: { url: string }; min: { url: string } }[];
  };
}

@Component<CGTeamworkNoteListItem>({
  components:{
    CGTeamworkTaskStatus
  }
})
export default class CGTeamworkNoteListItem extends Vue {
  @Prop({ required: true, type: Object })
  value!: CGTeamworkNoteListItemValue;

  @Prop({ type: Boolean, default: false })
  hidePipeline!: boolean;

  get safeHTML(): string {

    return DOMPurify.sanitize(this.value.message.text)
  }
}
</script>
