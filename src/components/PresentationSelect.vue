<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { presentation as Presentation } from '../graphql/types/presentation';
import 'vue-awesome/icons/image';
import 'vue-awesome/icons/video';
import { sortBy, groupBy, orderBy } from 'lodash';
import db from '@/db';
import humanizeTime from '@/utils/humanizeTime';
import { VNode } from 'vue';

interface Option {
  id: string;
  type: string;
  path: string;
  dirname: string;
  basename: string;
  modTime: Date;
}

interface OptionGroup {
  name: string;
  children: (Option | OptionGroup)[];
}

function basename(v: string): string {
  const parts = v.split('/');
  return parts[parts.length - 1];
}
function dirname(v: string): string {
  const parts = v.split('/');
  return parts.slice(0, parts.length - 1).join('/');
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
            type: 'button',
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
                return h('FaIcon', {
                  staticClass: 'inline-flex flex-center',
                  props: { name: 'image' },
                });
              case 'video':
                return h('FaIcon', {
                  staticClass: 'inline-flex flex-center',
                  props: { name: 'video' },
                });
              default:
                return h('span', [v.type]);
            }
          })(),
          h('span', { staticClass: 'mx-1' }, v.basename),
        ]
      );
    };

    const renderOptionGroup = (v: OptionGroup): VNode =>
      h('details', { attrs: { open: true }, key: v.name }, [
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
      this.options.map(i => ({
        id: i.id,
        type: i.type,
        path: i.raw.path,
        basename: basename(i.raw.path),
        dirname: dirname(i.raw.path),
        modTime: new Date(i.raw.modTime),
      })),
      [
        i => i.modTime,
        i => i.basename,
        i => ['video', 'image'].findIndex(j => j === i.type),
        i => i.id,
      ],
      ['desc', 'asc', 'asc', 'asc']
    );
  }

  get groupedOptions(): OptionGroup[] {
    return Object.entries(
      groupBy(this.sortedOptions, i => humanizeTime(i.modTime))
    ).map(([k, v]) => ({
      name: k,
      children: v,
    }));
  }

  @Watch('options', { immediate: true })
  autoSelect(): void {
    if (this.options.length === 0) {
      this.$emit('input', undefined);
      return;
    }
    if (this.options.some(i => i.id === this.value)) {
      return;
    }
    this.$emit(
      'input',
      sortBy(this.options, [
        i =>
          [db.preference.get('presentationType'), 'video', 'image'].findIndex(
            j => j === i.type
          ),
        i => -new Date(i.raw.modTime).getTime(),
        i => i.id,
      ])[0]?.id
    );
  }

  select(v: string): void {
    if (this.value === v) {
      return;
    }
    const match = this.options.find(i => i.id === v);
    this.$emit('input', v);
    if (match) {
      db.preference.set('presentationType', match.type);
    }
  }

  protected basename(v: string): string {
    const parts = v.split('/');
    return parts[parts.length - 1];
  }
}
</script>
