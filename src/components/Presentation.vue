<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { presentation } from '../graphql/types/presentation';
import {
  presentationNodeVariables,
  presentationNode,
} from '@/graphql/types/presentationNode';
import { filePathFormat } from '../const';

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
        this.isLoadFailed = false;
        return v.node?.__typename === 'Presentation' ? v.node : undefined;
      },
    },
  },
  render(h) {
    const src = this.path;
    const renderImage = () => {
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
})
export default class Presentation extends Vue {
  @Prop()
  id?: string;

  @Prop({ type: String, default: 'thumb' })
  size!: string;

  @Prop({ type: Boolean, default: false })
  autoplay!: boolean;

  node?: presentation;

  isLoadFailed = false;

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
}
</script>
