<template>
  <div ref="el">
    <svg ref="svg" :viewBox="`0 0 ${width} ${height}`" class="w-full"></svg>
  </div>
</template>

<script lang="ts">
import queries from '@/graphql/queries';
import {
  collectionStatsVariables,
  collectionStats_collections_tagCount as TagCount,
} from '@/graphql/types/collectionStats';
import addResizeListener from '@/utils/addResizeListener';
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  ref,
  toRefs,
  watchEffect,
} from '@vue/composition-api';
import * as d3 from 'd3';
import { uniqueId } from 'lodash';
import toDigitGrouped from 'to-digit-grouped';

export default defineComponent({
  name: 'CollectionTagTreemap',
  props: {
    variables: {
      type: Object as PropType<collectionStatsVariables>,
      required: true,
    },
    scale: {
      type: Number,
      default: 1,
    },
  },
  setup: (props) => {
    const { variables } = toRefs(props);
    const el = ref<HTMLDivElement | undefined>();
    const svg = ref<SVGSVGElement | undefined>();
    const width = ref(800);
    const { data } = queries.useCollectionStats(
      variables,
      computed(() => ({
        fetchPolicy: 'cache-and-network',
      }))
    );
    const idPrefix = uniqueId('collection-tag-treemap-') + '-';
    interface treeNode {
      name: string;
      data?: TagCount;
      children: Record<string, treeNode>;
    }
    const tree = computed(() => {
      const tagCount = data.value?.collections.tagCount ?? [];
      const root: treeNode = {
        name: '总计',
        children: {},
      };
      const addNode = (item: TagCount) => {
        let id = item.tag;
        if (id === '') {
          id = ':';
        }
        const path = id.split(':');
        const name = path[path.length - 1];
        let parent = root;
        for (const p of path.slice(0, -1)) {
          if (!parent.children[p]) {
            parent.children[p] = { name: p, children: {} };
          }
          parent = parent.children[p];
        }
        parent.children[name] = {
          name,
          data: item,
          children: {},
        };
      };
      for (const i of tagCount) {
        addNode(i);
      }
      return d3
        .hierarchy(root, (i) => Object.values(i.children))
        .sum((i) => i.data?.count ?? 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    });
    const height = computed(
      () =>
        props.scale * 0.5 * width.value +
        ((tree.value.value ?? 0) /
          (d3.median(
            tree.value
              .leaves()
              .map((i) => i.value ?? 0)
              .filter((i) => i > 0)
          ) ?? 1)) *
          10 *
          (320 / width.value)
    );

    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const draw = () => {
      if (!svg.value) {
        return;
      }

      const rectId = (
        d: d3.HierarchyRectangularNode<treeNode>,
        index: number
      ) => `${idPrefix}${index}`;
      const clipId = (
        d: d3.HierarchyRectangularNode<treeNode>,
        index: number
      ) => `${idPrefix}${index}-clip`;
      const treemap = d3
        .treemap<treeNode>()
        .size([width.value, height.value])
        .padding(4)
        .paddingTop(28);

      const leaf = d3
        .select(svg.value)
        .selectAll('g')
        .data(treemap(tree.value))
        .join((enter) => {
          const g = enter.append('g');
          g.append('title');
          g.append('rect');
          g.append('clipPath')
            .attr('id', clipId)
            .append('use')
            .attr('href', (d, index) => '#' + rectId(d, index));
          const text = g
            .append('text')
            .attr('fill', 'white')
            .attr('clip-path', (d, index) => `url(#${clipId(d, index)})`);
          text.append('tspan').attr('class', 'name');
          text
            .append('tspan')
            .attr('class', 'value')
            .attr('fill-opacity', '0.75');

          return g;
        })
        .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

      leaf.select('title').text(
        (d) =>
          `${
            d.depth === 0
              ? d.data.name
              : d
                  .ancestors()
                  .reverse()
                  .slice(1)
                  .map((d) => d.data.name)
                  .join(':')
          }\n${toDigitGrouped(d.value ?? 0)}`
      );

      leaf
        .select('rect')
        .attr('id', rectId)
        .attr('fill', (d) => {
          return color(d.data.name);
        })
        .attr('fill-opacity', '0.5')
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0);

      leaf.select('text').each((d, index, nodes) => {
        const text = nodes[index];
        if (!(text instanceof SVGTextElement)) {
          throw new Error(`CollectionTagTreemap: should be text element`);
        }
        const name = text.querySelector('tspan.name');
        if (!(name instanceof SVGTSpanElement)) {
          throw new Error(`CollectionTagTreemap: should be tspan element`);
        }
        const value = text.querySelector('tspan.value');
        if (!(value instanceof SVGTSpanElement)) {
          throw new Error(`CollectionTagTreemap: should be tspan element`);
        }

        name.textContent = d.data.name;
        name.setAttribute('x', '4');
        name.setAttribute('y', '20');
        value.textContent = (d.value ?? 0).toString();
        const textLength = name.getComputedTextLength();
        if (textLength < d.x1 - d.x0 - 40) {
          value.setAttribute('x', `${textLength + 8}`);
          value.setAttribute('y', '20');
        } else {
          value.setAttribute('x', `4`);
          value.setAttribute('y', `40`);
        }
      });
    };

    onMounted(() => {
      if (!el.value) {
        throw new Error(`CollectionTagTreemap: missing element`);
      }
      const stop = addResizeListener(el.value, (e) => {
        width.value = e.contentRect.width;
      });
      onUnmounted(stop);
      draw();
    });
    watchEffect(draw);

    return {
      svg,
      data,
      width,
      height,
      el,
    };
  },
});
</script>
