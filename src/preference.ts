import useStorage from '@/composables/useStorage';

const storage = location.protocol === 'file:' ? sessionStorage : localStorage;

export const isCellOverlayVisible = useStorage(
  storage,
  'is-cell-overlay-visible',
  true
);

export const isPresentationAnnotationVisible = useStorage(
  storage,
  'is-presentation-annotation-visible',
  true
);

export const viewerBackground = useStorage(
  storage,
  'viewer-background',
  'checkboard'
);

export const recentTags = useStorage(
  storage,
  'recent-collection-tags',
  [] as string[]
);
