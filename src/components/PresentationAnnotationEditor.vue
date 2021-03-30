<template lang="pug">
  svg.presentation-annotation-editor.svg-editor(
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    v-show="currentPainter !== 'null'"
  )
</template>

<script lang="ts">
import { filePathFormat } from '@/const';
import mutations from '@/graphql/mutations';
import { Presentation } from '@/graphql/types/Presentation';
import { presentationNode, presentationNodeVariables } from '@/graphql/types/presentationNode';
import { viewerAnnotationConfig } from '@/preference';
import { SVGEditor } from '@/svg-editor';
import { Painter } from '@/svg-editor/painter';
import EllipsePainter from '@/svg-editor/painters/ellipse';
import NullPainter from '@/svg-editor/painters/null';
import PolylinePainter from '@/svg-editor/painters/polyline';
import RectanglePainter from '@/svg-editor/painters/rectangle';
import SelectPainter from '@/svg-editor/painters/select';
import { TextPainter } from '@/svg-editor/painters/text';
import createSVGElement from '@/svg-editor/utils/createSVGElement';
import iterateHTMLCollection from '@/svg-editor/utils/iterateHTMLCollection';
import formatFileSize from '@/utils/formatFileSize';
import parseOptionalFloat from '@/utils/parseOptionalFloat';
import setDOMStringMap from '@/utils/setDOMStringMap';
import { UnwrapRef } from '@vue/composition-api';
import { debounce, DebouncedFunc } from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';

type PainterName =
  | 'null'
  | 'select'
  | 'polyline'
  | 'rectangle'
  | 'ellipse'
  | 'text';

@Component<PresentationAnnotationEditor>({
  apollo: {
    presentation: {
      query: require('@/graphql/queries/presentationNode.gql'),
      variables(): presentationNodeVariables {
        return { id: this.id ?? '', filePathFormat };
      },
      skip(): boolean {
        return !this.id;
      },
      update(v: presentationNode): Presentation | undefined {
        return v.node?.__typename === 'Presentation' ? v.node : undefined;
      },
    },
  },
  data() {
    return {
      editor: undefined,
      selected: undefined,
      debouncedSubmit: debounce(() => this.submit(), 500),
    };
  },
  mounted() {
    this.editor = new SVGEditor(this.$el, {
      style: `
polyline {
  stroke-linecap: round;
}
polyline,
rect,
ellipse {
  fill: none;
}
.invisible {
  visibility: hidden;
}
`,
      hooks: {
        drawEnd: () => {
          this.editor.clearHistory();
        },
        commit: () => {
          this.debouncedSubmit();
        },
        changeValue: () => {
          this.canUndo = this.editor.canUndo();
          this.canRedo = this.editor.canRedo();
        },
        clearHistory: () => {
          this.canRedo = this.editor.canRedo();
        },
        drawStart: (el) => {
          const [first, last] = this.frameRange;
          setDOMStringMap(el.dataset, 'firstFrame', first?.toString());
          setDOMStringMap(el.dataset, 'lastFrame', last?.toString());
          this.$emit('draw-start');
        },
        renderOperation: (el) => {
          if (this.frame == null) {
            el.classList.toggle('invisible', false);
            return;
          }
          const first = parseOptionalFloat(el.dataset.firstFrame);
          const last = parseOptionalFloat(el.dataset.lastFrame);
          el.classList.toggle(
            'invisible',
            (first != null && this.frame < first) ||
              (last != null && this.frame > last)
          );
        },
      },
    });
    this.$watch(
      () => this.painter,
      (v) => {
        this.setPainter(v);
      },
      { immediate: true }
    );
    this.$watch(
      () => this.id,
      async (v) => {
        if (!v) {
          this.presentation = undefined;
        }
        this.editor.clearHistory();
        this.selected = -1;
        await this.debouncedSubmit.flush();
        this.formData.id = v ?? '';
      }
    );
    this.$watch(
      () => this.frame,
      () => {
        this.editor.render();
      }
    );
    this.$watch(
      () => ({
        v: this.value,
        id: this.id,
      }),
      ({ v }) => {
        if (v.length > 1 << 20) {
          throw new Error(
            `PresentatinoAnnotationEditor: value length excess limit (1 MiB): ${formatFileSize(
              v.length
            )}`
          );
        }
        this.editor.setValue(v);
      },
      { immediate: true }
    );
  },
  setup: () => {
    return {
      config: viewerAnnotationConfig,
    };
  },
})
export default class PresentationAnnotationEditor extends Vue {
  @Prop({ type: String })
  id?: string;

  @Prop({ type: Number })
  frame?: number;

  @Prop({ type: Boolean, default: false })
  toolbar!: boolean;

  @Prop({ type: String, default: 'select' })
  painter!: PainterName;

  $el!: SVGSVGElement;

  editor!: SVGEditor;

  currentPainter: PainterName = 'null';

  presentation?: Presentation;

  canUndo = false;
  canRedo = false;
  loadingCount = 0;

  config!: UnwrapRef<typeof viewerAnnotationConfig>;

  selected = -1;

  formData = {
    id: '',
  };

  debouncedSubmit!: DebouncedFunc<() => Promise<void>>;

  get value(): string {
    return (
      this.presentation?.metadata.find((i) => i.k === 'annotation')?.v ?? ''
    );
  }

  get frameRange(): [number | undefined, number | undefined] {
    if (this.presentation?.type !== 'video') {
      return [undefined, undefined];
    }
    switch (this.config.frameRangeMode) {
      case 'CURRENT':
        return [this.frame, this.frame];
      case 'GTE_CURRENT':
        return [this.frame, undefined];
      case 'LTE_CURRENT':
        return [undefined, this.frame];
      case 'INPUT':
        return [this.config.firstFrame, this.config.lastFrame];
      default:
        return [undefined, undefined];
    }
  }

  newPainter(name: PainterName): Painter {
    switch (name) {
      case 'null':
        return new NullPainter(this.editor);
      case 'select': {
        const ret = new SelectPainter(this.editor);
        let frameRangeChangeIgnore = -1;
        ret.onSelect = (v) => {
          this.selected = v;
          const el = this.editor.operation(v);
          if (el) {
            frameRangeChangeIgnore = v;
            this.config.firstFrame = parseOptionalFloat(el.dataset.firstFrame);
            this.config.lastFrame = parseOptionalFloat(el.dataset.lastFrame);
            if (this.config.firstFrame || this.config.lastFrame) {
              this.config.frameRangeMode = 'INPUT';
            } else {
              this.config.frameRangeMode = 'NULL';
            }
          }
        };
        const unwatch = this.$watch(
          () => this.frameRange,
          ([first, last]) => {
            if (frameRangeChangeIgnore === this.selected || this.selected < 0) {
              frameRangeChangeIgnore = -1;
              return;
            }
            const selected = this.editor.operation(this.selected);
            if (!selected) {
              return;
            }
            setDOMStringMap(selected.dataset, 'firstFrame', first?.toString());
            setDOMStringMap(selected.dataset, 'lastFrame', last?.toString());
            this.editor.render();
            this.editor.commit();
          },
          { deep: true }
        );
        ret.addCleanup(unwatch);
        return ret;
      }
      case 'polyline': {
        const ret = new PolylinePainter(this.editor);
        ret.config = this.config;
        return ret;
      }
      case 'rectangle': {
        const ret = new RectanglePainter(this.editor);
        ret.config = this.config;
        return ret;
      }
      case 'ellipse': {
        const ret = new EllipsePainter(this.editor);
        ret.config = this.config;
        return ret;
      }
      case 'text': {
        const painter = new TextPainter(this.editor);
        painter.customRenderPopup = (el) => {
          painter.defaultRenderPopup(el);
          const textarea = el.querySelector('textarea');
          if (!textarea) {
            throw new Error('should has textarea');
          }
          textarea.classList.add('form-textarea');
        };
        painter.config = this.config;
        return painter;
      }
    }
  }

  setPainter(name: PainterName): void {
    if (name === this.currentPainter) {
      return;
    }
    const painter = this.newPainter(name);
    if (!painter) {
      throw new Error();
    }
    this.editor.painter = painter;
    this.currentPainter = name;
    this.$emit('update:painter', name);
  }

  async submit(): Promise<void> {
    const id = this.formData.id;
    if (!id || this.loadingCount > 0 || this.editor.painter.isDrawing) {
      return;
    }
    this.loadingCount += 1;
    try {
      const rawValue = this.editor.getValue();
      const g = createSVGElement('g');
      g.innerHTML = rawValue;
      for (const i of iterateHTMLCollection(g.children)) {
        i.classList.forEach((c) => i.classList.remove(c));
      }
      const value = g.innerHTML;
      if (value === this.value) {
        // not submit when no changes
        return;
      }

      await mutations.updatePresentationMetadata({
        input: {
          data: [
            {
              id,
              key: 'annotation',
              value,
            },
          ],
        },
      });
      this.canUndo = this.editor.canUndo();
      this.canRedo = this.editor.canRedo();
    } finally {
      this.loadingCount -= 1;
    }
  }

  get width(): number {
    const v = parseFloat(
      this.presentation?.metadata.find((i) => i.k === 'width')?.v ?? ''
    );
    if (!isFinite(v)) {
      return 1920;
    }
    return v;
  }

  get height(): number {
    const v = parseFloat(
      this.presentation?.metadata.find((i) => i.k === 'height')?.v ?? ''
    );
    if (!isFinite(v)) {
      return 1080;
    }
    return v;
  }
}
</script>
