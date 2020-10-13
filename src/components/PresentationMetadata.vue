<template lang="pug">
  dl
    dt 文件大小
    dd.pl-4 {{ fileSizeText }}
    template(v-if="metadata.width && metadata.height")
      dt 尺寸
      dd.pl-4 {{metadata.width}}x{{metadata.height}}
    template(v-if="metadata.duration")
      dt 时长
      dd.pl-4 {{durationText}}
    template(v-if="metadata.frameCount")
      dt 帧数
      dd.pl-4 {{metadata.frameCount}}
    template(v-if="metadata.frameRate")
      dt 帧速率
      dd.pl-4 {{metadata.frameRate}}
    template(v-for="{k, v} in value.metadata")
      template(v-if="k === 'width'")
      template(v-else-if="k === 'height'")
      template(v-else-if="k === 'duration'")
      template(v-else-if="k === 'frame-count'")
      template(v-else-if="k === 'frame-rate'")
      template(v-else)
        dt {{k}}
        dd.pl-4 {{v}}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { presentation as Presentation } from '@/graphql/types/presentation';
import { camelCase } from 'lodash';
import formatFileSize from '@/utils/formatFileSize';
import formatDuration from '@/utils/formatDuration';

@Component<PresentationMetadata>({})
export default class PresentationMetadata extends Vue {
  @Prop({ type: Object, required: true })
  value!: Presentation;

  get metadata(): Record<string, string> {
    return Object.fromEntries(
      this.value.metadata.map(({ k, v }) => [camelCase(k), v])
    );
  }

  get fileSizeText(): string {
    return formatFileSize(this.value.raw?.size ?? 0, true);
  }

  get durationText(): string {
    return formatDuration(parseFloat(this.metadata.duration) * 1e3);
  }
}
</script>
