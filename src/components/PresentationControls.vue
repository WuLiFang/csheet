<template lang="pug">
  .presentation-controls
    .inline-flex(
      v-if="parent.frameRate > 0"
      class="sm:order-2 flex-wrap justify-center my-px sm:mx-1"
    )
      button.form-button(
        type="button"
        class="flex-none p-0 w-12 h-8 m-px"
        class="flex justify-center items-center"
        title="至起始帧（快捷键：Home）"
        @click="() => parent.seekFrame(parent.firstFrame, true)"
      ) 
        FaIcon(name="fast-backward")
      button.form-button(
        type="button"
        class="flex-none p-0 w-12 h-8 m-px"
        class="flex justify-center items-center"
        title="上一帧（快捷键：←）"
        @click="() => parent.seekFrameOffset(-1, true)"
      ) 
        FaIcon(name="step-backward")
      InputNumber.form-input(
        ref="frameInput"
        class="flex-auto w-24 h-8 z-10 m-px"
        v-model="currentFrameProxy"
        title="当前帧（快捷键：f）"
      )
      button.form-button(
        type="button"
        class="flex-none p-0 w-12 h-8 m-px"
        class="flex justify-center items-center"
        title="下一帧（快捷键：→）"
        @click="() => parent.seekFrameOffset(1, true)"
      ) 
        FaIcon(name="step-forward")
      button.form-button(
        type="button"
        class="flex-none p-0 w-12 h-8 m-px"
        class="flex justify-center items-center"
        title="至结束帧（快捷键：End）"
        @click="() => parent.seekFrame(parent.lastFrame, true)"
      ) 
        FaIcon(name="fast-forward")
    .inline-flex.items-center(
      class="flex-wrap sm:order-3 my-px sm:mx-1"
    )
      DurationInput(
        ref="timeInput"
        v-model="currentTimeProxy"
        class="h-8 w-32 m-px text-center"
        title="当前时间（快捷键：g）"
      )
      button.form-button(
        type="button"
        class="flex-initial p-0 w-24 h-8 m-px"
        class="flex justify-center items-center"
        title="播放/暂停（快捷键：空格）"
        @click="() => parent.paused ? parent.play(): parent.pause()"
      ) 
        FaIcon(:name="parent.paused ? 'play' : 'pause'")
      select.form-select(
        ref="playbackRateSelect"
        class="flex-initial p-0 pl-2 w-20 h-8  m-px"
        v-model="formData.playbackRate"
        title="播放倍速 （快捷键：j/k/l）"
      )
        option(
          v-for="i in playbackRateOptions"
          :value="i"
        ) ×{{i.toFixed(1)}}
    .inline-flex.items-center(
      v-if="parent.frameRate > 0"
      class="sm:order-1 my-px sm:mx-1"
    )
      button.form-button(
        type="button"
        class="flex-none p-0 w-10 h-6 m-px"
        class="flex justify-center items-center"
        title="向前跳帧（快捷键：Shift + ←）"
        @click="skipFrameBackward()"
      ) 
        FaIcon.object-center(name="backward")
      input.form-input(
        type="number"
        class="flex-auto p-0 w-12 h-6 spin-button-none z-10 text-center"
        v-model.number="formData.frameSkip"
        @keyup.enter="$event.target.blur()"
        @focus="$event.target.select()"
        title="跳帧的帧数"
      )
      button.form-button(
        type="button"
        class="flex-none p-0 w-10 h-6 m-px"
        class="flex justify-center items-center"
        title="向后跳帧（快捷键：Shift + →）"
        @click="skipFrameForward()"
      ) 
        FaIcon(name="forward")
</template>

<script lang="ts">
import clamp from '@/utils/clamp';
import moment from 'moment';
import { Component, Prop, Vue } from 'vue-property-decorator';
import DurationInput from './DurationInput.vue';
import type InputNumber from './global/InputNumber.vue';
import type Presentation from './Presentation.vue';

@Component<PresentationControls>({
  components: {
    DurationInput,
  },
  mounted() {
    this.$watch(
      () => this.formData.playbackRate,
      (v) => {
        this.$emit('update:playbackRate', v);
      },
      { immediate: true }
    );
    this.$watch(
      () => this.playbackRate,
      (v) => {
        this.formData.playbackRate = v;
      },
      { immediate: true }
    );
  },
})
export default class PresentationControls extends Vue {
  @Prop({ required: true })
  parent!: Presentation;

  @Prop({ type: Number, default: 1 })
  playbackRate!: number;

  $refs!: {
    frameInput: InputNumber;
    playbackRateSelect: HTMLSelectElement;
    timeInput: DurationInput;
  };

  playbackRateOptions = [0.1, 0.2, 0.5, 1, 2, 4, 8];
  formData = {
    currentFrame: 0,
    frameSkip: 10,
    playbackRate: 1,
  };

  get currentTimeProxy(): string {
    return moment.duration(this.parent.currentTime * 1e3).toISOString();
  }

  set currentTimeProxy(s: string) {
    const v = moment.duration(s).asSeconds();
    this.parent.seek(v, true);
  }

  get currentFrameProxy(): number {
    return this.parent.currentFrame;
  }

  set currentFrameProxy(v: number) {
    this.parent.seekFrame(v, true);
  }

  setPlaybackRate(v: number): void {
    this.formData.playbackRate = v;
  }

  offsetPlaybackRateIndex(offset: number): void {
    const o = this.playbackRateOptions;
    this.formData.playbackRate =
      o[clamp(o.indexOf(this.formData.playbackRate) + offset, 0, o.length - 1)];
  }

  skipFrameForward(): void {
    this.parent.seekFrameOffset(this.formData.frameSkip, true);
  }

  skipFrameBackward(): void {
    this.parent.seekFrameOffset(-this.formData.frameSkip, true);
  }
}
</script>
