<script lang="ts">
import usePresentationMetadata from '@/composables/usePresentationMetadata';
import queries from '@/graphql/queries';
import clamp from '@/utils/clamp';
import getPathBasename from '@/utils/getPathBasename';
import { computed, ref, watch } from '@vue/composition-api';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { filePathFormat } from '../const';
import { Presentation as Data } from '../graphql/types/Presentation';

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
        this.isLoadFailed = false;
      }, 1e3);
    };
    const renderImage = () => {
      this.currentTime = 0;
      this.paused = true;
      return h('img', {
        domProps: {
          src,
          alt: getPathBasename(src),
          draggable: this.draggable,
        },
        staticClass: 'object-contain w-full h-full',
        style: {
          filter: this.imageFilter(this),
        },
        on: {
          error: handleError,
          dragstart: this.handleDrag.bind(this),
        },
      });
    };
    const renderVideo = () => {
      return h('video', {
        staticClass: 'object-contain w-full h-full',
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
          dragstart: this.handleDrag.bind(this),
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
  mounted() {
    this.$watch(
      () => this.currentTime,
      (v) => {
        this.$emit('timeUpdate', v);
      },
    );
    this.$watch(
      () => this.currentFrame,
      (v) => {
        this.$emit('frameUpdate', v);
      },
    );
  },
  setup: (props: Pick<Presentation, 'id'>) => {
    const { node, version } = queries.usePresentationNode(
      computed(() => ({ id: props.id ?? '', filePathFormat })),
      computed(() => ({
        skip: !props.id,
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
    watch(version, () => {
      isLoadFailed.value = false;
    });
    return {
      node,
      height,
      width,
      frameRate,
      frameCount,
      firstFrame,
      lastFrame,
      version,
      isLoadFailed,
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
  node?: Data;
  frameCount!: number;
  frameRate!: number;
  firstFrame!: number;
  lastFrame!: number;
  width!: number;
  height!: number;
  version!: number;
  isLoadFailed!: boolean;

  paused = true;
  currentTime = 0;

  get type(): string {
    return this.node?.type ?? '';
  }

  get url(): string | undefined {
    switch (this.size) {
      case 'regular':
        return this.node?.regular?.url;
      case 'thumb':
      default:
        return this.node?.thumb?.url;
    }
  }

  get src(): string {
    if (!this.id) {
      return require('@/assets/img/default.svg');
    }
    if (this.isTranscodeFailed) {
      return require('@/assets/img/transcode_failed.svg');
    }
    if (this.isLoadFailed) {
      return require('@/assets/img/load_failed.svg');
    }
    return this.url || require('@/assets/img/transcoding.svg');
  }

  get isTranscodeFailed(): boolean {
    switch (this.size) {
      case 'regular':
        return this.node?.isRegularTranscodeFailed ?? false;
      case 'thumb':
      default:
        return this.node?.isThumbTranscodeFailed ?? false;
    }
  }

  handleDrag(e: DragEvent): void {
    if (!this.node) {
      return;
    }
    e.dataTransfer?.setData('text/plain', this.node.raw.path);
  }

  get currentFrame(): number {
    return this.firstFrame + Math.round(this.currentTime * this.frameRate);
  }

  play(): void {
    if (this.$el instanceof HTMLVideoElement) {
      this.$el.play();
    }
  }

  pause(): void {
    if (this.$el instanceof HTMLVideoElement) {
      this.$el.pause();
    }
  }

  seek(time: number, pause = false): void {
    if (!isFinite(time)) {
      return;
    }
    if (pause) {
      this.pause();
    }
    if (this.$el instanceof HTMLVideoElement) {
      // time out of range has different behaviour on different browser
      this.$el.currentTime = clamp(
        time,
        0,
        // substruct 0.001 second to avoid outrange on firefox
        this.$el.duration - 0.001
      );
    }
  }

  seekFrame(f: number, pause = false): void {
    if (this.frameRate <= 0) {
      return;
    }
    this.seek(
      // add 0.001 frame to avoid display previous frame for encoded video
      (f - this.firstFrame + 0.001) / this.frameRate,
      pause
    );
  }

  seekFrameOffset(offset: number, pause = false): void {
    this.seekFrame(this.currentFrame + offset, pause);
  }
}
</script>
