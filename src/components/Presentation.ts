import { Presentation } from '@/graphql/types/Presentation';
import { computed, onMounted, Ref, SetupContext } from '@vue/composition-api';

export function usePresentationFile(
  presentation: Ref<Presentation | undefined>,
  {
    size,
    isLoadFailed,
    isLoading,
    retryCount,
  }: {
    size: Ref<string>;
    isLoading?: Ref<boolean>;
    isLoadFailed: Ref<boolean>;
    retryCount?: Ref<number>;
  }
): {
  url: Ref<string | undefined>;
  isTranscodeFailed: Ref<boolean>;
  isTranscoding: Ref<boolean>;
  src: Ref<string>;
} {
  const ret = computed(() => {
    switch (size.value) {
      case 'regular':
        return {
          url: presentation.value?.regular?.url,
          isNeedTranscode:
            presentation.value != null && presentation.value.regular == null,
          isTranscodeFailed:
            presentation.value?.isRegularTranscodeFailed ?? false,
        };
      case 'thumb':
      default:
        return {
          url: presentation.value?.thumb?.url,
          isNeedTranscode:
            presentation.value != null && presentation.value.thumb == null,
          isTranscodeFailed:
            presentation.value?.isThumbTranscodeFailed ?? false,
        };
    }
  });

  const url = computed(() => ret.value.url);
  const isTranscodeFailed = computed(() => ret.value.isTranscodeFailed);
  const isTranscoding = computed(
    () => ret.value.isNeedTranscode && !isTranscodeFailed.value
  );
  const src = computed((): string => {
    if (isTranscoding?.value) {
      return require('@/assets/img/transcoding.svg');
    }
    if (isLoading?.value) {
      return require('@/assets/img/loading.svg');
    }
    if (isTranscodeFailed.value) {
      return require('@/assets/img/transcode_failed.svg');
    }
    if (isLoadFailed.value) {
      return require('@/assets/img/load_failed.svg');
    }
    if (!url.value) {
      return require('@/assets/img/default.svg');
    }
    if ((retryCount?.value ?? 0) > 0) {
      return url.value + `?t=${Date.now()}`;
    }
    return url.value;
  });

  return {
    url,
    isTranscodeFailed,
    isTranscoding,
    src,
  };
}

export function usePresentationDrag(
  presentation: Ref<Presentation | undefined>
) {
  return (e: DragEvent): void => {
    if (!presentation.value) {
      return;
    }
    e.dataTransfer?.setData('text/plain', presentation.value.raw.path);
  };
}

export function setupCommon(
  ctx: SetupContext,
  presentation: Ref<Presentation | undefined>,
  {
    size,
    isLoadFailed,
    retryCount,
    loadingCount,
  }: {
    size: Ref<string>;
    isLoadFailed: Ref<boolean>;
    retryCount?: Ref<number>;
    loadingCount: Ref<number>;
  }
): {
  url: Ref<string | undefined>;
  isTranscodeFailed: Ref<boolean>;
  isTranscoding: Ref<boolean>;
  src: Ref<string>;
  _handleDrag: (e: DragEvent) => void;
} {
  // show loading instead default while data cached but image need loading.
  onMounted(() => {
    loadingCount.value += 1;
    requestAnimationFrame(() => {
      loadingCount.value -= 1;
    });
  });

  return {
    ...usePresentationFile(presentation, {
      size,
      isLoadFailed,
      isLoading: computed(() => loadingCount.value > 0),
      retryCount,
    }),
    _handleDrag: usePresentationDrag(presentation),
  };
}
