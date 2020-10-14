<template lang="pug">
  dl
    dt 文件大小
    dd.pl-4 
      span {{ fileSizeText }}
      span.mx-2.text-gray-500 （{{ fileSizeExactText }}）
    template(v-if="metadata.width && metadata.height")
      dt 尺寸
      dd.pl-4 {{metadata.width}}x{{metadata.height}}
    template(v-if="metadata.frameCount")
      dt 帧数
      dd.pl-4 {{metadata.frameCount}}
    template(v-if="metadata.frameRate")
      dt 帧速率
      dd.pl-4 {{metadata.frameRate}}
    template(v-if="metadata.duration")
      dt 时长
      dd.pl-4 {{durationText}}
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
import toDigitGrouped from 'to-digit-grouped';

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
    const size = this.value.raw?.size ?? 0;
    return formatFileSize(size);
  }

  get fileSizeExactText(): string {
    const size = this.value.raw?.size ?? 0;
    return `${toDigitGrouped(size)} 字节`;
  }

  get durationText(): string {
    return formatDuration(parseFloat(this.metadata.duration) * 1e3);
  }
}
</script>
