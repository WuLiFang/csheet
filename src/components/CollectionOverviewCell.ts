import { Presentation } from '@/graphql/types/Presentation';
import { viewerBackground } from '@/preference';
import { computed, Ref } from '@vue/composition-api';
import useElementSize from '@/composables/useElementSize';
import usePresentationMetadata from '@/composables/usePresentationMetadata';
import useObjectContainRate from '@/composables/useObjectContainRate';

export const backgroundClass = computed((): string => {
  switch (viewerBackground.value) {
    case 'checkboard':
      return 'bg-checkboard-sm';
    case 'checkboard-sm':
      return 'bg-checkboard-xs';
    case 'white':
      return 'bg-white';
    default:
      return 'bg-black';
  }
});

export const imageFilter = (p: {
  isLoadFailed: boolean;
  isTranscodeFailed: boolean;
  size: string;
  node: Presentation | undefined;
}): string => {
  if (p.isLoadFailed || p.isTranscodeFailed || !p.node) {
    switch (p.size) {
      case 'regular':
        return '';
      case 'thumb':
      default:
        switch (viewerBackground.value) {
          case 'white':
            return '';
          default:
            return 'brightness(0.3)';
        }
    }
  }
  return '';
};

export function usePresentationClass(
  el: Ref<HTMLElement | undefined>,
  value: Ref<Presentation | undefined>
): Ref<string> {
  const { width: outerWidth, height: outerHeight } = useElementSize(el);
  const { width: innerWidth, height: innerHeight } = usePresentationMetadata(
    value
  );
  const objectContainRate = useObjectContainRate(
    outerWidth,
    outerHeight,
    innerWidth,
    innerHeight
  );

  const presentationClass = computed(() => {
    if (objectContainRate.value > 0.618) {
      return '';
    } else if (innerWidth < innerHeight) {
      return 'object-cover w-full max-h-64';
    } else {
      return 'object-cover h-full max-w-full';
    }
  });
  return presentationClass;
}
