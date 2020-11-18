<template lang="pug">
  dl
    dt {{ $t('presentation-metadata.file-size') }}
    dd.pl-4
      span {{ fileSizeText }}
      span.mx-2.text-gray-500.whitespace-no-wrap （{{ fileSizeExactText }}）
    dt {{ $t('presentation-metadata.modified-time') }}
    dd.pl-4
      TimeWidget(:value="value.raw.modTime" format="llll")
    template(v-if="metadata.width && metadata.height")
      dt {{ $t('presentation-metadata.resolution') }}
      dd.pl-4 {{metadata.width}}x{{metadata.height}}
    template(v-if="metadata.frameCount > 0")
      dt {{ $t('presentation-metadata.frame-range') }}
      dd.pl-4.flex.items-center
        input.form-input(
          v-model.number="formData.firstFrame"
          class="h-8 w-12 text-center flex-auto spin-button-none"
          type="number"
          @focus="hasFocus = true; $event.target.select()"
          @keyup.enter="$event.target.blur()"
          @blur="blur()"
        )
        span.mx-1 -
        input.form-input(
          v-model.number="formData.lastFrame"
          class="h-8 w-12 text-center flex-auto spin-button-none"
          type="number"
          @focus="hasFocus = true; $event.target.select()"
          @keyup.enter="$event.target.blur()"
          @blur="blur()"
        )
    template(v-if="metadata.duration")
      dt {{ $t('presentation-metadata.duration') }}
      dd.pl-4 {{durationText}}
    template(v-for="{k, v} in value.metadata")
      template(v-if="k === 'width'")
      template(v-else-if="k === 'height'")
      template(v-else-if="k === 'duration'")
      template(v-else-if="k === 'first-frame'")
      template(v-else-if="k === 'last-frame'")
      template(v-else-if="k === 'annotation'")
      template(v-else)
        dt {{ $te(`presentation-metadata.${k}`) ? $t(`presentation-metadata.${k}`) : k }}
        dd.pl-4 {{v}}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Presentation } from '@/graphql/types/Presentation';
import { camelCase } from 'lodash';
import formatFileSize from '@/utils/formatFileSize';
import formatDuration from '@/utils/formatDuration';
import parseFirstFrame from '@/utils/parseFirstFrame';
import toDigitGrouped from 'to-digit-grouped';
import client from '@/client';

@Component<PresentationMetadata>({
  mounted() {
    this.$watch(
      () => [this.firstFrame, this.lastFrame],
      ([first, last]) => {
        this.setTimeRange(first, last);
      },
      { immediate: true }
    );
    this.$watch(
      () => this.formData.firstFrame,
      v => {
        this.setTimeRange(v);
      },
      { immediate: true }
    );
    this.$watch(
      () => this.formData.lastFrame,
      v => {
        this.setTimeRange(undefined, v);
      },
      { immediate: true }
    );
  },
})
export default class PresentationMetadata extends Vue {
  @Prop({ type: Object, required: true })
  value!: Presentation;

  formData = {
    firstFrame: 1,
    lastFrame: 1,
  };

  hasFocus = false;

  get metadata(): Record<string, string | undefined> {
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
    const duration = parseFloat(this.metadata.duration ?? '');
    if (!isFinite(duration)) {
      return this.metadata.duration ?? '';
    }
    return formatDuration(duration * 1e3);
  }

  get frameCount(): number {
    return parseInt(this.metadata.frameCount ?? '') || 0;
  }

  get firstFrame(): number {
    return parseFirstFrame(this.metadata.firstFrame ?? '');
  }

  set firstFrame(v: number) {
    this.setTimeRange(v);
  }

  get lastFrame(): number {
    return parseInt(this.metadata.lastFrame ?? '') || 0;
  }

  set lastFrame(v: number) {
    this.setTimeRange(undefined, v);
  }

  setTimeRange(first?: number, last?: number): void {
    if (first != null && last != null) {
      last = first + (this.frameCount - 1);
    } else if (first != null) {
      last = first + (this.frameCount - 1);
    } else if (last != null) {
      first = last - (this.frameCount - 1);
    } else {
      return;
    }
    this.formData.firstFrame = first;
    this.formData.lastFrame = last;
  }

  async submit(): Promise<void> {
    await client.presentation.updateMetadata({
      input: {
        data: [
          {
            id: this.value.id,
            key: 'first-frame',
            value: this.formData.firstFrame.toString(),
          },
          {
            id: this.value.id,
            key: 'last-frame',
            value: this.formData.lastFrame.toString(),
          },
        ],
      },
    });
  }

  blur(): void {
    this.hasFocus = false;
    this.submit();
  }
}
</script>
