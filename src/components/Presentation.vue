<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { presentation } from '../graphql/types/presentation';
import {
  presentationNodeVariables,
  presentationNode,
} from '@/graphql/types/presentationNode';
import { filePathFormat } from '../const';
import parseFrameRate from '@/utils/parseFrameRate';

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
      this.updateCurrentFrame();
      return h('img', {
        domProps: {
          src,
          alt: this.node?.raw?.path,
          draggable: true,
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
          draggable: true,
        },
        on: {
          error: () => {
            this.isLoadFailed = true;
          },
          timeupdate: () => {
            this.updateCurrentFrame();
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

  $el!: HTMLVideoElement | HTMLImageElement;
  node?: presentation;

  isLoadFailed = false;
  rawCurrentFrame = 0;

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
    return (
      parseInt(this.node?.metadata.find(i => i.k === 'first-frame')?.v ?? '') ||
      0
    );
  }

  get currentFrame(): number {
    return this.firstFrame + this.rawCurrentFrame;
  }

  updateCurrentFrame(): void {
    if (!this.$el) {
      return;
    }
    if (this.$el instanceof HTMLImageElement) {
      this.rawCurrentFrame = 0;
      return;
    }
    this.rawCurrentFrame = Math.round(this.$el.currentTime * this.frameRate);
  }

  pause(): void {
    if (this.$el instanceof HTMLVideoElement) {
      this.$el.pause();
    }
  }

  seekFrame(f: number, pause = false): void {
    if (!isFinite(f)) {
      return;
    }
    if (this.frameRate <= 0) {
      return;
    }
    if (pause) {
      this.pause();
    }
    if (this.$el instanceof HTMLVideoElement) {
      // add 0.001 frame to avoid display previous frame for encoded video
      this.$el.currentTime = ((f - this.firstFrame + 0.001) / this.frameRate); 
    }
  }

  seekFrameOffset(offset: number, pause = false): void {
    this.seekFrame(this.currentFrame + offset, pause);
  }
}
</script>
