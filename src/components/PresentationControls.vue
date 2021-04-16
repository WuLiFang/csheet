<template>
  <div class="presentation-controls">
    <div
      v-if="parent.frameRate > 0"
      class="inline-flex sm:order-2 flex-wrap justify-center my-px sm:mx-1"
    >
      <button
        class="form-button flex-none p-0 w-12 h-8 m-px flex justify-center items-center"
        type="button"
        title="至起始帧（快捷键：Home）"
        @click="() => parent.seekFrame(parent.firstFrame, true)"
      >
        <FaIcon name="fast-backward"></FaIcon>
      </button>
      <button
        class="form-button flex-none p-0 w-12 h-8 m-px flex justify-center items-center"
        type="button"
        title="上一帧（快捷键：←）"
        @click="() => parent.seekFrameOffset(-1, true)"
      >
        <FaIcon name="step-backward"></FaIcon>
      </button>
      <InputNumber
        ref="frameInput"
        v-model="currentFrameProxy"
        class="form-input flex-auto w-24 h-8 z-10 m-px"
        title="当前帧（快捷键：f）"
      ></InputNumber>
      <button
        class="form-button flex-none p-0 w-12 h-8 m-px flex justify-center items-center"
        type="button"
        title="下一帧（快捷键：→）"
        @click="() => parent.seekFrameOffset(1, true)"
      >
        <FaIcon name="step-forward"></FaIcon>
      </button>
      <button
        class="form-button flex-none p-0 w-12 h-8 m-px flex justify-center items-center"
        type="button"
        title="至结束帧（快捷键：End）"
        @click="() => parent.seekFrame(parent.lastFrame, true)"
      >
        <FaIcon name="fast-forward"></FaIcon>
      </button>
    </div>
    <div class="inline-flex items-center flex-wrap sm:order-3 my-px sm:mx-1">
      <DurationInput
        ref="timeInput"
        v-model="currentTimeProxy"
        class="h-8 w-32 m-px text-center"
        title="当前时间（快捷键：g）"
      ></DurationInput>
      <button
        class="form-button flex-initial p-0 w-24 h-8 m-px flex justify-center items-center"
        type="button"
        title="播放/暂停（快捷键：空格）"
        @click="() => (parent.paused ? parent.play() : parent.pause())"
      >
        <FaIcon :name="parent.paused ? 'play' : 'pause'"></FaIcon>
      </button>
      <select
        ref="playbackRateSelect"
        v-model="formData.playbackRate"
        class="form-select flex-initial p-0 pl-2 w-20 h-8 m-px"
        title="播放倍速 （快捷键：j/k/l）"
      >
        <option v-for="i in playbackRateOptions" :key="i" :value="i">
          ×{{ i.toFixed(1) }}
        </option>
      </select>
      <span :class="currentFrameRateClass" class="w-20 text-right"
        >{{ currentFrameRateText }} fps</span
      >
    </div>
    <div
      v-if="parent.frameRate > 0"
      class="inline-flex items-center sm:order-1 my-px sm:mx-1"
    >
      <button
        class="form-button flex-none p-0 w-10 h-6 m-px flex justify-center items-center"
        type="button"
        title="向前跳帧（快捷键：Shift + ←）"
        @click="skipFrameBackward()"
      >
        <FaIcon class="object-center" name="backward"></FaIcon>
      </button>
      <input
        v-model.number="formData.frameSkip"
        class="form-input flex-auto p-0 w-12 h-6 spin-button-none z-10 text-center"
        type="number"
        title="跳帧的帧数"
        @keyup.enter="$event.target.blur()"
        @focus="$event.target.select()"
      />
      <button
        class="form-button flex-none p-0 w-10 h-6 m-px flex justify-center items-center"
        type="button"
        title="向后跳帧（快捷键：Shift + →）"
        @click="skipFrameForward()"
      >
        <FaIcon name="forward"></FaIcon>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import InputNumber from '@/components/global/InputNumber.vue';
import useNumberChangeRate from '@/composables/useNumberChangeRate';
import useObservable from '@/composables/useObservable';
import useVideoCurrentTime from '@/composables/useVideoCurrentTime';
import clamp from '@/utils/clamp';
import observableFromRef from '@/utils/observableFromRef';
import {
  computed,
  defineComponent,
  PropType,
  reactive,
  ref,
  watch,
} from '@vue/composition-api';
import moment from 'moment';
import { filter, throttleTime } from 'rxjs/operators';
import DurationInput from './DurationInput.vue';
import type PresentationStatic from './Presentation.static.vue';
import type Presentation from './Presentation.vue';
export default defineComponent({
  name: 'PresentationControls',
  components: {
    DurationInput,
  },
  props: {
    parent: {
      type: Object as PropType<Presentation | PresentationStatic>,
      required: true,
    },

    playbackRate: {
      type: Number,
      default: 1,
    },
  },
  setup: (props, ctx) => {
    const frameInput = ref<InputNumber>();
    const timeInput = ref<DurationInput>();
    const playbackRateSelect = ref<HTMLSelectElement>();
    const formData = reactive({
      frameSkip: 10,
      playbackRate: 1,
    });
    watch(
      () => formData.playbackRate,
      (v) => {
        ctx.emit('update:playbackRate', v);
      },
      { immediate: true }
    );
    watch(
      () => props.playbackRate,
      (v) => {
        formData.playbackRate = v;
      },
      { immediate: true }
    );
    const currentTimeProxy = computed({
      get(): string {
        return moment.duration(props.parent.currentTime * 1e3).toISOString();
      },
      set(s: string) {
        const v = moment.duration(s).asSeconds();
        props.parent.seek(v, true);
      },
    });

    const currentFrameProxy = computed({
      get(): number {
        return props.parent.currentFrame;
      },
      set(v: number) {
        props.parent.seekFrame(v, true);
      },
    });
    const playbackRateOptions = [0.1, 0.2, 0.5, 1, 2, 4, 8];
    const setPlaybackRate = (v: number): void => {
      formData.playbackRate = v;
    };

    const offsetPlaybackRateIndex = (offset: number): void => {
      const o = playbackRateOptions;
      formData.playbackRate =
        o[clamp(o.indexOf(formData.playbackRate) + offset, 0, o.length - 1)];
    };

    const skipFrameForward = (): void => {
      props.parent.seekFrameOffset(formData.frameSkip, true);
    };

    const skipFrameBackward = (): void => {
      props.parent.seekFrameOffset(-formData.frameSkip, true);
    };

    const video = computed(() => {
      if (props.parent.el instanceof HTMLVideoElement) {
        return props.parent.el;
      }
    });
    const currentTime = useVideoCurrentTime(video);

    const currentTimeRate = useNumberChangeRate(currentTime);

    const frameRate = computed(() => props.parent.frameRate);
    const currentFrameRate = computed(
      () => currentTimeRate.value * frameRate.value
    );
    const currentFrameRateText = ref('');
    watch(
      useObservable(
        observableFromRef(currentTimeRate).pipe(
          filter((v) => v >= 0), // ignore loop end
          throttleTime(50)
        ),
        0
      ),
      () => {
        currentFrameRateText.value = currentFrameRate.value.toFixed(1);
      },
      { immediate: true }
    );
    const currentFrameRateClass = computed(() => {
      if (props.parent.paused) {
        return 'text-gray-500';
      }
      const dropframe =
        frameRate.value * props.playbackRate - currentFrameRate.value;
      if (dropframe > 5) {
        return 'text-red-500';
      } else if (dropframe > 2) {
        return 'text-red-300';
      }
      return '';
    });

    return {
      currentFrameProxy,
      currentTimeProxy,
      formData,
      frameInput,
      offsetPlaybackRateIndex,
      playbackRateOptions,
      playbackRateSelect,
      setPlaybackRate,
      skipFrameBackward,
      skipFrameForward,
      timeInput,
      currentFrameRateText,
      currentFrameRateClass,
    };
  },
});
</script>
