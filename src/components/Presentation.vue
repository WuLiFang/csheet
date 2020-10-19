<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { presentation } from '../graphql/types/presentation';
import {
  presentationNodeVariables,
  presentationNode,
} from '@/graphql/types/presentationNode';
import { filePathFormat } from '../const';
import parseFrameRate from '@/utils/parseFrameRate';
import parseFirstFrame from '@/utils/parseFirstFrame';
import clamp from '@/utils/clamp';

export function fileSrc(v: string | undefined): string {
  const d = require('@/assets/img/transcoding.svg');
  if (!v) {
    return d;
  }
  return v;
}

@Component<Presentation>({
  apollo: {
    node: {
      query: require('@/graphql/queries/presentationNode.gql'),
      variables(): presentationNodeVariables {
        return { id: this.id ?? '', filePathFormat };
      },
      skip(): boolean {
        return !this.id;
      },
      update(v: presentationNode): presentation | undefined {
        return v.node?.__typename === 'Presentation' ? v.node : undefined;
      },
    },
  },
  render(h) {
    const src = this.path;
    const renderImage = () => {
      this.currentTime = 0;
      this.paused = true;
      return h('img', {
        domProps: {
          src,
          alt: this.node?.raw?.path,
          draggable: this.draggable,
        },
        style: {
          filter: this.imageFilter,
        },
        on: {
          error: () => {
            this.isLoadFailed = true;
          },
          dragstart: this.handleDrag.bind(this),
        },
      });
    };
    const renderVideo = () => {
      return h('video', {
        domProps: {
          src,
          alt: this.node?.raw?.path,
          controls: true,
          loop: true,
          autoplay: this.autoplay,
          draggable: this.draggable,
          playbackRate: clamp(this.playbackRate, 0.1, 10),
        },
        on: {
          error: () => {
            this.isLoadFailed = true;
          },
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
      () => this.path,
      () => {
        this.isLoadFailed = false;
      }
    );
    this.$watch(
      () => this.currentTime,
      v => {
        this.$emit('timeUpdate', v);
      },
      { immediate: true }
    );
    this.$watch(
      () => this.currentFrame,
      v => {
        this.$emit('frameUpdate', v);
      },
      { immediate: true }
    );
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

  @Prop({ type: Number, default: 1 })
  playbackRate!: number;

  $el!: HTMLVideoElement | HTMLImageElement;
  node?: presentation;

  isLoadFailed = false;
  paused = true;
  currentTime = 0;

  get type(): string {
    return this.node?.type ?? '';
  }

  get path(): string {
    if (this.isTranscodeFailed) {
      return require('@/assets/img/transcode_failed.svg');
    }
    if (this.isLoadFailed) {
      return require('@/assets/img/load_failed.svg');
    }
    if (!this.id || this.isLoadFailed) {
      return require('@/assets/img/default.svg');
    }
    switch (this.size) {
      case 'regular':
        return fileSrc(this.node?.regular?.url);
      case 'thumb':
      default:
        return fileSrc(this.node?.thumb?.url);
    }
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

  get imageFilter(): string {
    if (this.isLoadFailed || this.isTranscodeFailed || !this.id) {
      switch (this.size) {
        case 'regular':
          return '';
        case 'thumb':
        default:
          return 'brightness(0.3)';
      }
    }
    return '';
  }

  handleDrag(e: DragEvent): void {
    if (!this.node) {
      return;
    }
    e.dataTransfer?.setData('text/plain', this.node.raw.path);
  }

  get frameCount(): number {
    return (
      parseInt(
        this.node?.metadata?.find(i => i.k === 'frame-count')?.v ?? ''
      ) || 0
    );
  }

  get frameRate(): number {
    return (
      parseFrameRate(
        this.node?.metadata?.find(i => i.k === 'frame-rate')?.v ?? ''
      ) || 0
    );
  }

  get firstFrame(): number {
    return parseFirstFrame(
      this.node?.metadata.find(i => i.k === 'first-frame')?.v ?? ''
    );
  }

  get lastFrame(): number {
    return (
      parseInt(this.node?.metadata.find(i => i.k === 'last-frame')?.v ?? '') ||
      this.firstFrame + this.frameCount
    );
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
