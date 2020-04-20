<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { presentation } from '../graphql/types/presentation';
import {
  presentationNodeVariables,
  presentationNode,
} from '@/graphql/types/presentationNode';
import { filePathFormat } from '../const';

export function fileSrc(v: string | undefined): string {
  const d = '/static/transcoding.svg';
  if (!v) {
    return d;
  }
  return `/files/${v}`;
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
      return h('img', {
        domProps: {
          src,
          alt: this.node?.raw?.path,
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
          autoplay: true,
        },
      });
    };
    if (this.path === undefined) {
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

  node?: presentation;

  get path(): string | undefined {
    if (!this.id) {
      return '/static/default.svg';
    }
    switch (this.size) {
      case 'regular':
        return fileSrc(this.node?.regular?.path);
      case 'thumb':
      default:
        return fileSrc(this.node?.thumb?.path);
    }
  }
}
</script>
