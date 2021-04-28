import { PainterName } from '@/components/PresentationAnnotationEditor';
import useCleanup from '@/composables/useCleanup';
import { Collection } from '@/graphql/types/Collection';
import { Presentation } from '@/graphql/types/Presentation';
import toHotKey from '@/utils/toHotKey';
import { computed, Ref, ref, SetupContext } from '@vue/composition-api';
import { sortBy, throttle, uniq } from 'lodash';

import { mdiMenuUp, mdiMenuDown, mdiClose, mdiAutorenew } from '@mdi/js';

export const icons = {
  mdiMenuUp,
  mdiMenuDown,
  mdiClose,
  mdiAutorenew,
};

export interface PresentationControls {
  paused: boolean;
  seekFrame: (value: number, pause?: boolean) => void;
  seekFrameOffset: (offset: number, pause?: boolean) => void;
  play: () => void;
  pause: () => void;
  skipFrameForward: () => void;
  skipFrameBackward: () => void;
  focusTimeInput: () => void;
  focusFrameInput: () => void;
  offsetPlaybackRateIndex: (offset: number) => void;
  setPlaybackRate: (value: number) => void;
}

export function setupKeyboardShortcut({
  close,
  jumpPrev,
  jumpNext,
  setPainter,
  undo,
  redo,
  firstFrame,
  lastFrame,
  skipEvent,
  presentationControls: pc,
}: {
  firstFrame: Ref<number>;
  lastFrame: Ref<number>;
  jumpPrev: () => void;
  jumpNext: () => void;
  close: () => void;
  undo?: () => void;
  redo?: () => void;
  setPainter?: (name: PainterName) => void;
  skipEvent: (e: KeyboardEvent) => boolean;
  presentationControls: Ref<PresentationControls | undefined>;
}): () => void {
  const throttleJump = throttle((fn: () => void) => fn(), 800);
  const throttleSeek = throttle((fn: () => void) => fn(), 100);
  const handleKeydown = (e: KeyboardEvent) => {
    if (skipEvent(e)) {
      return;
    }
    const throttleRepeatJump = e.repeat
      ? throttleJump
      : (fn: () => void) => fn();
    const throttleRepeatSeek = e.repeat
      ? throttleSeek
      : (fn: () => void) => fn();
    switch (toHotKey(e)) {
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case ' ':
        e.preventDefault();
        if (pc.value?.paused) {
          pc.value?.play();
        } else {
          pc.value?.pause();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        throttleRepeatJump(() => {
          jumpPrev();
        });
        break;
      case 'ArrowDown':
        e.preventDefault();
        throttleRepeatJump(() => {
          jumpNext();
        });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        throttleRepeatSeek(() => {
          pc.value?.seekFrameOffset(-1, true);
        });
        break;
      case 'ArrowRight':
        e.preventDefault();
        throttleRepeatSeek(() => {
          pc.value?.seekFrameOffset(1, true);
        });
        break;
      case '+ArrowLeft':
        e.preventDefault();
        throttleRepeatSeek(() => {
          pc.value?.skipFrameBackward();
        });
        break;
      case '+ArrowRight':
        e.preventDefault();
        throttleRepeatSeek(() => {
          pc.value?.skipFrameForward();
        });
        break;
      case 'Home':
        e.preventDefault();
        pc.value?.seekFrame(firstFrame.value, true);
        break;
      case 'End':
        e.preventDefault();
        pc.value?.seekFrame(lastFrame.value, true);
        break;
      case 'g': {
        e.preventDefault();
        pc.value?.focusFrameInput();
        break;
      }
      case 'f': {
        e.preventDefault();
        pc.value?.focusTimeInput();
        break;
      }
      case 'j': {
        e.preventDefault();
        pc.value?.offsetPlaybackRateIndex(-1);
        break;
      }
      case 'k': {
        e.preventDefault();
        pc.value?.setPlaybackRate(1);
        break;
      }
      case 'l': {
        e.preventDefault();
        pc.value?.offsetPlaybackRateIndex(1);
        break;
      }
      case '^z': {
        e.preventDefault();
        undo?.();
        break;
      }
      case '^y': {
        e.preventDefault();
        redo?.();
        break;
      }
      case 'q': {
        e.preventDefault();
        setPainter?.('null');
        break;
      }
      case 'w': {
        e.preventDefault();
        setPainter?.('select');
        break;
      }
      case 'e': {
        e.preventDefault();
        setPainter?.('polyline');
        break;
      }
      case 'r': {
        e.preventDefault();
        setPainter?.('rectangle');
        break;
      }
      case 't': {
        e.preventDefault();
        setPainter?.('ellipse');
        break;
      }
      case 'y': {
        e.preventDefault();
        setPainter?.('text');
        break;
      }
    }
  };

  const { addCleanup, cleanup } = useCleanup();

  document.body.addEventListener('keydown', handleKeydown, { capture: true });
  addCleanup(() =>
    document.body.removeEventListener('keydown', handleKeydown, {
      capture: true,
    })
  );

  return cleanup;
}


function animateOnce(el: HTMLElement, animateClass: string) {
  el.classList.remove(animateClass);
  el.classList.add(animateClass);
  const handleAnimationEnd = () => {
    el.classList.remove(animateClass);
    el.removeEventListener('animationend', handleAnimationEnd);
  };
  el.addEventListener('animationend', handleAnimationEnd);
}

export function setupCommon(
  ctx: SetupContext,
  {
    value,
    prev,
    next,
    prevButton,
    nextButton,
  }: {
    prevButton: Ref<HTMLButtonElement | undefined>;
    nextButton: Ref<HTMLButtonElement | undefined>;
    prev: Ref<Collection | undefined>;
    next: Ref<Collection | undefined>;
    value: Ref<Collection>;
  }
): {
  visible: Ref<boolean>;
  jumpPrev: () => void;
  jumpNext: () => void;
  close: () => void;
  prefetchURLs: Ref<string[]>;
  presentationID: Ref<string>;
  presentation: Ref<Presentation | undefined>;
} {
  const visible = ref(true);
  const presentationID = ref('');
  const presentation = computed(() =>
    value.value.presentations.find((i) => i.id === presentationID.value)
  );
  const jumpPrev = () => {
    if (!prev.value) {
      return;
    }
    if (prevButton.value) {
      animateOnce(prevButton.value, 'animate-button-click');
    }
    ctx.emit('update:value', prev.value);
  };
  const jumpNext = () => {
    if (!next.value) {
      return;
    }
    if (nextButton.value) {
      animateOnce(nextButton.value, 'animate-button-click');
    }
    ctx.emit('update:value', next.value);
  };
  const close = () => {
    visible.value = false;
  };

  const prefetchURLs = computed(() => {
    const ret: string[] = [];
    for (const i of [next.value, value.value, prev.value]) {
      if (!i) {
        continue;
      }
      sortBy(i.presentations, [(i) => -new Date(i.raw.modTime ?? 0).getTime()])
        .slice(0, 5)
        .forEach((j) => {
          ret.push(j.regular?.url || require('@/assets/img/transcoding.svg'));
        });
    }
    return uniq(ret);
  });
  return {
    visible,
    jumpPrev,
    jumpNext,
    close,
    prefetchURLs,
    presentationID,
    presentation,
  };
}
