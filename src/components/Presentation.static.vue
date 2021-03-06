<script lang="ts">
import { setupCommon } from '@/components/Presentation';
import usePresentationMetadata from '@/composables/usePresentationMetadata';
import clamp from '@/utils/clamp';
import getPathBasename from '@/utils/getPathBasename';
import relativeURL from '@/utils/relativeURL';
import { PropType, ref, toRefs } from '@vue/composition-api';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Presentation as Data } from '../graphql/types/Presentation';

@Component<Presentation>({
  render(h) {
    const src = relativeURL(this.src);
    const version = this.version;
    const handleError = () => {
      const v = this.version;
      if (v !== version) {
        return;
      }
      this.isLoadFailed = true;
    };
    const renderImage = () => {
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

  props: {
    value: Object as PropType<Data>,
  },
  setup: (props, ctx) => {
    const { value, size } = toRefs(
      props as {
        value: Data | undefined;
        size: string;
      }
    );
    const node = value;
    const {
      height,
      width,
      frameRate,
      frameCount,
      firstFrame,
      lastFrame,
    } = usePresentationMetadata(node);
    const isLoadFailed = ref(false);
    const el = ref<HTMLElement>();
    const loadingCount = ref(0);
    const { src, url, isTranscodeFailed, _handleDrag } = setupCommon(
      ctx,
      node,
      {
        size,
        isLoadFailed,
        loadingCount,
      }
    );
    return {
      el,
      firstFrame,
      frameCount,
      frameRate,
      height,
      isLoadFailed,
      isTranscodeFailed,
      lastFrame,
      node,
      src,
      url,
      width,
      _handleDrag,
    };
  },
})
export default class Presentation extends Vue {
  @Prop()
  value?: Data;

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
  el?: HTMLVideoElement | HTMLImageElement;
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
  src!: string;

  _handleDrag!: (e: DragEvent) => void;
}
</script>
