<template>
  <dl>
    <template v-if="value.raw.size">
      <dt>{{ $t('presentation-metadata.file-size') }}</dt>
      <dd class="pl-4">
        <span>{{ fileSizeText }}</span
        ><span class="mx-2 text-gray-500 whitespace-no-wrap"
          >（{{ fileSizeExactText }}）</span
        >
      </dd>
    </template>
    <template v-if="value.raw.modTime">
      <dt>{{ $t('presentation-metadata.modified-time') }}</dt>
      <dd class="pl-4">
        <TimeWidget :value="value.raw.modTime" format="llll"></TimeWidget>
      </dd>
    </template>
    <template v-if="width && height">
      <dt>{{ $t('presentation-metadata.resolution') }}</dt>
      <dd class="pl-4">{{ width }}x{{ height }}</dd>
    </template>
    <template v-if="frameCount > 0">
      <dt>{{ $t('presentation-metadata.frame-count') }}</dt>
      <dd class="pl-4">{{ frameCount }}</dd>
    </template>
    <template v-if="frameCount > 0">
      <dt>{{ $t('presentation-metadata.frame-range') }}</dt>
      <dd class="pl-4 flex items-center">
        <input
          v-model.number="formData.firstFrame"
          class="form-input h-8 w-12 text-center flex-auto spin-button-none"
          type="number"
          @focus="
            hasFocus = true;
            $event.target.select();
          "
          @keyup.enter="$event.target.blur()"
          @blur="blur()"
        /><span class="mx-1">-</span>
        <input
          v-model.number="formData.lastFrame"
          class="form-input h-8 w-12 text-center flex-auto spin-button-none"
          type="number"
          @focus="
            hasFocus = true;
            $event.target.select();
          "
          @keyup.enter="$event.target.blur()"
          @blur="blur()"
        />
      </dd>
    </template>
    <template v-if="duration">
      <dt>{{ $t('presentation-metadata.duration') }}</dt>
      <dd class="pl-4">{{ durationText }}</dd>
    </template>
    <template v-if="frameRateText">
      <dt>{{ $t('presentation-metadata.frame-rate') }}</dt>
      <dd class="pl-4">{{ frameRateText }}</dd>
    </template>
    <template v-if="pixelFormat">
      <dt>{{ $t('presentation-metadata.pixel-format') }}</dt>
      <dd class="pl-4">{{ pixelFormat }}</dd>
    </template>
    <template v-for="(v, k) in extra">
      <dt :key="k + '-key'">
        {{
          $te(`presentation-metadata.${k}`)
            ? $t(`presentation-metadata.${k}`)
            : k
        }}
      </dt>
      <dd :key="k + '-value'" class="pl-4">{{ v }}</dd>
    </template>
  </dl>
</template>

<script lang="ts">
import usePresentationMetadata from '@/composables/usePresentationMetadata';
import mutations from '@/graphql/mutations';
import { Presentation } from '@/graphql/types/Presentation';
import { info } from '@/message';
import formatDuration from '@/utils/formatDuration';
import formatFileSize from '@/utils/formatFileSize';
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  toRefs,
  watch,
} from '@vue/composition-api';
import toDigitGrouped from 'to-digit-grouped';

export default defineComponent({
  name: 'PresentationMetadata',
  props: {
    value: {
      type: Object as PropType<Presentation>,
      required: true,
    },
  },
  setup: (props) => {
    const { value } = toRefs(props);
    const {
      firstFrame,
      lastFrame,
      duration,
      frameCount,
      frameRate,
      frameRateText,
      height,
      pixelFormat,
      width,
      extra,
    } = usePresentationMetadata(value);

    const formData = reactive({
      firstFrame: 1,
      lastFrame: 1,
    });

    const hasFocus = ref(false);

    const fileSizeText = computed(() => {
      const size = value.value.raw?.size ?? 0;
      return formatFileSize(size);
    });

    const fileSizeExactText = computed(() => {
      const size = value.value.raw?.size ?? 0;
      return `${toDigitGrouped(size)} 字节`;
    });

    const durationText = computed(() => {
      return formatDuration(duration.value * 1e3);
    });

    const setTimeRange = (first?: number, last?: number) => {
      if (first != null && last != null) {
        last = first + (frameCount.value - 1);
      } else if (first != null) {
        last = first + (frameCount.value - 1);
      } else if (last != null) {
        first = last - (frameCount.value - 1);
      } else {
        return;
      }
      formData.firstFrame = first;
      formData.lastFrame = last;
    };

    const submit = async () => {
      await mutations.updatePresentationMetadata({
        input: {
          data: [
            {
              id: value.value.id,
              key: 'first-frame',
              value: formData.firstFrame.toString(),
            },
            {
              id: value.value.id,
              key: 'last-frame',
              value: formData.lastFrame.toString(),
            },
          ],
        },
      });
      info('帧范围已更新');
    };

    const blur = () => {
      hasFocus.value = false;
      submit();
    };

    onMounted(() => {
      watch(
        [firstFrame, lastFrame],
        ([first, last]) => {
          setTimeRange(first, last);
        },
        { immediate: true }
      );
      watch(
        () => formData.firstFrame,
        (v) => {
          setTimeRange(v);
        },
        { immediate: true }
      );
      watch(
        () => formData.lastFrame,
        (v) => {
          setTimeRange(undefined, v);
        },
        { immediate: true }
      );
    });

    return {
      firstFrame,
      lastFrame,
      duration,
      frameCount,
      frameRate,
      frameRateText,
      height,
      pixelFormat,
      width,
      extra,
      formData,
      hasFocus,
      fileSizeText,
      fileSizeExactText,
      durationText,
      setTimeRange,
      submit,
      blur,
    };
  },
});
</script>
