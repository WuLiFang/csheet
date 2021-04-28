<script lang="ts">
import { viewerPresentationType } from '@/preference';
import basename from '@/utils/getPathBasename';
import dirname from '@/utils/getPathDirname';
import humanizeTime from '@/utils/humanizeTime';
import { groupBy, orderBy, sortBy } from 'lodash';
import { VNode } from 'vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Presentation } from '../graphql/types/Presentation';
import { mdiImage, mdiVideo } from '@mdi/js';

interface Option {
  id: string;
  type: string;
  path: string;
  dirname: string;
  basename: string;
  modTime: Date | undefined;
}

interface OptionGroup {
  name: string;
  class: string;
  children: (Option | OptionGroup)[];
}

@Component<PresentationSelect>({
  render(h) {
    const renderOption = (v: Option): VNode => {
      return h(
        'li',
        {
          staticClass:
            'bg-gray-900 w-full hover:bg-gray-800 text-left flex items-center px-1 pl-4 py-px',
          class: {
            'bg-blue-600 hover:bg-blue-500': v.id === this.value,
          },
          attrs: {
            title: v.path,
          },
          key: v.id,
          on: {
            click: () => this.select(v.id),
          },
        },
        [
          ((): VNode => {
            switch (v.type) {
              case 'image':
                return h(
                  'svg',
                  {
                    staticClass: 'inline fill-current h-6',
                    attrs: {
                      viewBox: '0 0 24 24',
                    },
                  },
                  [h('path', { attrs: { d: mdiImage } })]
                );
              case 'video':
                return h(
                  'svg',
                  {
                    staticClass: 'inline fill-current h-6',
                    attrs: {
                      viewBox: '0 0 24 24',
                    },
                  },
                  [h('path', { attrs: { d: mdiVideo } })]
                );
              default:
                return h('span', [v.type]);
            }
          })(),
          h('span', { staticClass: 'mx-1 break-all' }, v.basename),
        ]
      );
    };

    const renderOptionGroup = (v: OptionGroup): VNode =>
      h('details', { attrs: { open: true }, key: v.name, class: v.class }, [
        h('summary', { staticClass: 'sticky top-0 bg-gray-900' }, v.name),
        h('ol', v.children.map(renderItem)),
      ]);
    const renderItem = (v: OptionGroup | Option): VNode =>
      'children' in v ? renderOptionGroup(v) : renderOption(v);

    return h(
      'div',
      {
        staticClass: 'presentation-select overflow-y-auto max-h-64',
      },
      this.groupedOptions.map(renderItem)
    );
  },
})
export default class PresentationSelect extends Vue {
  @Prop({ type: String })
  value?: string;

  @Prop({ type: Array, required: true })
  options!: Presentation[];

  get sortedOptions(): Option[] {
    return orderBy(
      this.options.map((i) => ({
        id: i.id,
        type: i.type,
        path: i.raw.path,
        basename: basename(i.raw.path),
        dirname: dirname(i.raw.path),
        modTime: i.raw.modTime ? new Date(i.raw.modTime) : undefined,
      })),
      [
        (i) => i.modTime ?? 0,
        (i) => i.basename,
        (i) => ['video', 'image'].findIndex((j) => j === i.type),
        (i) => i.id,
      ],
      ['desc', 'asc', 'asc', 'asc']
    );
  }

  get groupedOptions(): OptionGroup[] {
    return Object.entries(
      groupBy(this.sortedOptions, (i) =>
        i.modTime ? humanizeTime(i.modTime) : this.$t('deleted')
      )
    ).map(([k, v]) => ({
      name: k,
      children: v,
      class: k === this.$t('deleted') ? 'text-gray-500' : '',
    }));
  }

  @Watch('options', { immediate: true })
  autoSelect(): void {
    if (this.options.length === 0) {
      this.$emit('input', undefined);
      return;
    }
    if (this.options.some((i) => i.id === this.value)) {
      return;
    }
    this.$emit(
      'input',
      sortBy(this.options, [
        (i) =>
          [viewerPresentationType.value, 'video', 'image'].findIndex(
            (j) => j === i.type
          ),
        (i) => -new Date(i.raw.modTime || 0).getTime(),
        (i) => i.id,
      ])[0]?.id
    );
  }

  select(v: string): void {
    if (this.value === v) {
      return;
    }
    const match = this.options.find((i) => i.id === v);
    this.$emit('input', v);
    if (match) {
      viewerPresentationType.value = match.type;
    }
  }
}
</script>
