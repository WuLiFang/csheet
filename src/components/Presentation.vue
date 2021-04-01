<script lang="ts">
import usePresentationMetadata from '@/composables/usePresentationMetadata';
import queries from '@/graphql/queries';
import clamp from '@/utils/clamp';
import getPathBasename from '@/utils/getPathBasename';
import {
  computed,
  ref,
  toRefs,
  watch
} from '@vue/composition-api';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { filePathFormat } from '../const';
import { Presentation as Data } from '../graphql/types/Presentation';
import {
  useCurrentFrame,
  useFrameControl,
  usePresentationDrag,
  usePresentationFile
} from './Presentation';

@Component<Presentation>({
  render(h) {
    const src = this.src;
    const version = this.version;
    const handleError = () => {
      const v = this.version;
      if (v !== version) {
        return;
      }
      this.isLoadFailed = true;
      setTimeout(() => {
        if (v !== this.version) {
          return;
        }
        this.retryCount += 1;
        this.isLoadFailed = false;
      }, 2 ** this.retryCount * 1000);
    };
    const renderImage = () => {
      this.currentTime = 0;
      this.paused = true;
      return h('img', {
        ref: 'el',
        domProps: {
          src,
          alt: getPathBasename(src),
          draggable: this.draggable,
        },
        style: {
          filter: this.imageFilter(this),
        },
        on: {
          error: handleError,
          dragstart: this._handleDrag,
        },
      });
    };
    const renderVideo = () => {
      return h('video', {
        ref: 'el',
        domProps: {
          src,
          alt: getPathBasename(src),
          controls: this.controls,
          loop: true,
          autoplay: this.autoplay,
          draggable: this.draggable,
          playbackRate: clamp(this.playbackRate, 0.1, 10),
        },
        on: {
          error: handleError,
          timeupdate: (e: Event & { target: HTMLVideoElement }) => {
            this.currentTime = e.target.currentTime;
          },
          play: () => {
            this.paused = false;
          },
          pause: () => {
            this.paused = true;
          },
          dragstart: this._handleDrag,
        },
      });
    };
    if (src?.endsWith('.svg')) {
      return renderImage();
    }
    switch (this.node?.type) {
      case undefined:
      case 'image':
        return renderImage();
      case 'video':
        if (this.size === 'thumb') {
          return renderImage();
        }
        return renderVideo();
      default:
        return h('p', '尚未支持的格式');
    }
  },
  setup: (props, ctx) => {
    const { id, size } = toRefs(
      props as {
        id: string | undefined;
        size: string;
      }
    );
    const loadingCount = ref(0);
    const { node, version } = queries.usePresentationNode(
      computed(() => ({ id: id.value ?? '', filePathFormat })),
      computed(() => ({
        skip: !id.value,
        loadingCount,
      }))
    );
    const {
      height,
      width,
      frameRate,
      frameCount,
      firstFrame,
      lastFrame,
    } = usePresentationMetadata(node);
    const isLoadFailed = ref(false);
    const retryCount = ref(0);
    watch(version, () => {
      retryCount.value = 0;
      isLoadFailed.value = false;
    });

    const el = ref<HTMLElement>();
    const currentTime = ref(0);
    const currentFrame = useCurrentFrame({
      firstFrame,
      currentTime,
      frameRate,
    });
    watch(currentTime, (v) => {
      ctx.emit('timeUpdate', v);
    });
    watch(currentFrame, (v) => {
      ctx.emit('frameUpdate', v);
    });

    const { play, pause, seek, seekFrame, seekFrameOffset } = useFrameControl({
      el,
      firstFrame,
      currentFrame,
      frameRate,
    });

    const { src, url, isTranscodeFailed } = usePresentationFile(node, {
      size,
      isLoadFailed,
      retryCount,
      isLoading: computed(() => loadingCount.value > 0),
    });

    const _handleDrag = usePresentationDrag(node);
    return {
      currentFrame,
      currentTime,
      el,
      firstFrame,
      frameCount,
      frameRate,
      height,
      isLoadFailed,
      isTranscodeFailed,
      lastFrame,
      node,
      pause,
      play,
      retryCount,
      seek,
      seekFrame,
      seekFrameOffset,
      src,
      url,
      version,
      width,
      _handleDrag,
    };
  },
})
export default class Presentation extends Vue {
  @Prop()
  id?: string;

  @Prop({ type: String, default: 'thumb' })
  size!: string;

  @Prop({ type: Boolean, default: false })
  autoplay!: boolean;

  @Prop({ type: Boolean, default: false })
  draggable!: boolean;

  @Prop({ type: Boolean, default: false })
  controls!: boolean;

  @Prop({ type: Number, default: 1 })
  playbackRate!: number;

  @Prop({ type: Function, default: () => '' })
  imageFilter!: (v: Presentation) => string;

  $el!: HTMLVideoElement | HTMLImageElement;
  node: Data | undefined;
  frameCount!: number;
  frameRate!: number;
  firstFrame!: number;
  lastFrame!: number;
  width!: number;
  height!: number;
  version!: number;
  isLoadFailed!: boolean;
  isTranscodeFailed!: boolean;
  retryCount!: number;
  currentFrame!: number;
  currentTime!: number;
  src!: string;
  play!: () => void;
  pause!: () => void;
  seek!: (time: number, pause?: boolean) => void;
  seekFrame!: (frame: number, pause?: boolean) => void;
  seekFrameOffset!: (frame: number, pause?: boolean) => void;
  paused = true;

  _handleDrag!: (e: DragEvent) => void;
}
</script>
