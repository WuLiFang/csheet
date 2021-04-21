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
        @click="() => seekFrame(parent.firstFrame, true)"
      >
        <FaIcon name="fast-backward"></FaIcon>
      </button>
      <button
        class="form-button flex-none p-0 w-12 h-8 m-px flex justify-center items-center"
        type="button"
        title="上一帧（快捷键：←）"
        @click="() => seekFrameOffset(-1, true)"
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
        @click="() => seekFrameOffset(1, true)"
      >
        <FaIcon name="step-forward"></FaIcon>
      </button>
      <button
        class="form-button flex-none p-0 w-12 h-8 m-px flex justify-center items-center"
        type="button"
        title="至结束帧（快捷键：End）"
        @click="() => seekFrame(parent.lastFrame, true)"
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
        @click="() => (paused ? play() : pause())"
      >
        <FaIcon :name="paused ? 'play' : 'pause'"></FaIcon>
      </button>
      <select
        ref="playbackRateSelect"
        v-model="playbackRateProxy"
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
        v-model.number="frameSkipSize"
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
import useFrameControl from '@/composables/useFrameControl';
import useProperty from '@/composables/useProperty';
import clamp from '@/utils/clamp';
import observableFromRef from '@/utils/observableFromRef';
import {
  computed,
  defineComponent,
  PropType,
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
    const frameSkipSize = ref(10);
    const playbackRateProxy = computed({
      get() {
        return props.playbackRate;
      },
      set(v: number) {
        ctx.emit('update:playbackRate', v);
      },
    });

    const playbackRateOptions = [0.1, 0.2, 0.5, 1, 2, 4, 8];
    const setPlaybackRate = (v: number): void => {
      playbackRateProxy.value = v;
    };

    const offsetPlaybackRateIndex = (offset: number): void => {
      const o = playbackRateOptions;
      playbackRateProxy.value =
        o[clamp(o.indexOf(playbackRateProxy.value) + offset, 0, o.length - 1)];
    };
    const video = computed(() => {
      if (props.parent.el instanceof HTMLVideoElement) {
        return props.parent.el;
      }
    });
    const currentTime = useProperty(video, 'currentTime', 0);

    const frameRate = computed(() => props.parent.frameRate);

    const firstFrame = computed(() => props.parent.firstFrame);
    const currentFrame = computed(() => {
      return firstFrame.value + Math.round(currentTime.value * frameRate.value);
    });
    const currentFrameProxy = computed({
      get(): number {
        return (
          props.parent.firstFrame +
          Math.round(currentTime.value * frameRate.value)
        );
      },
      set(v: number) {
        seekFrame(v, true);
      },
    });
    const {
      seek,
      seekFrame,
      seekFrameOffset,
      play,
      pause,
      paused,
    } = useFrameControl({
      el: video,
      firstFrame,
      currentFrame,
      frameRate,
    });

    const skipFrameForward = (): void => {
      seekFrameOffset(frameSkipSize.value, true);
    };

    const skipFrameBackward = (): void => {
      seekFrameOffset(-frameSkipSize.value, true);
    };

    const currentTimeProxy = computed({
      get(): string {
        return moment.duration(currentTime.value * 1e3).toISOString();
      },
      set(s: string) {
        const v = moment.duration(s).asSeconds();
        seek(v, true);
      },
    });

    const currentTimeRate = useNumberChangeRate(currentTime);

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
      if (paused.value) {
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
      currentFrameRateClass,
      currentFrameRateText,
      currentTimeProxy,
      frameInput,
      frameSkipSize,
      offsetPlaybackRateIndex,
      pause,
      paused,
      play,
      playbackRateOptions,
      playbackRateProxy,
      playbackRateSelect,
      seek,
      seekFrame,
      seekFrameOffset,
      setPlaybackRate,
      skipFrameBackward,
      skipFrameForward,
      timeInput,
    };
  },
});
</script>
