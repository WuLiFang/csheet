<template>
  <div ref="el">
    <svg ref="svg" :viewBox="`0 0 ${width} ${height}`"></svg>
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
import { uniqueId, throttle } from 'lodash';
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
      key: string;
      data?: TagCount;
      children: Record<string, treeNode>;
    }
    const tree = computed(() => {
      const tagCount = data.value?.collections.tagCount ?? [];
      const root: treeNode = {
        name: '总计',
        key: '',
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
            parent.children[p] = {
              name: p,
              key: `${parent.key}:${p}`,
              children: {},
            };
          }
          parent = parent.children[p];
        }
        parent.children[name] = {
          name,
          key: `${parent.key}:${name}`,
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
        .selectAll<SVGGElement, undefined>('g')
        .data<d3.HierarchyRectangularNode<treeNode>>(
          treemap(tree.value),
          (d, index) => {
            return d?.data.key ?? index;
          }
        )
        .join(
          (enter) => {
            const g = enter
              .append('g')
              .attr('opacity', '0')
              .attr('transform', (d) => `translate(${d.x0},${d.y0}),scale(0)`);
            g.append('title');
            g.append('rect');
            g.append('clipPath').append('use');
            const text = g.append('text').attr('fill', 'white');

            text.append('tspan').attr('class', 'name');
            text
              .append('tspan')
              .attr('class', 'value')
              .attr('fill-opacity', '0.75');

            return g;
          },
          undefined,
          (exit) => {
            exit
              .style('opacity', '1')
              .transition()
              .style('opacity', '0')
              .attr('transform', (d) => `translate(${d.x1},${d.y1}),scale(0)`)
              .remove();
          }
        );

      leaf
        .transition()
        .attr('opacity', '1')
        .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

      leaf
        .select('clipPath')
        .attr('id', clipId)
        .select('use')
        .attr('href', (d, index) => '#' + rectId(d, index));
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
        .transition()
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0);

      leaf
        .select<SVGTextElement>('text')
        .attr('clip-path', (d, index) => `url(#${clipId(d, index)})`)
        .each(function (d) {
          const name = this.querySelector<SVGTSpanElement>('tspan.name');
          const value = this.querySelector<SVGTSpanElement>('tspan.value');
          if (!(name && value)) {
            throw new Error('CollctionTagTreemap: missing tspan element');
          }
          name.textContent = d.data.name;
          name.setAttribute('x', '4');
          name.setAttribute('y', '20');
          const { x, width } = name.getBBox();
          d3.select(value)
            .transition()
            .textTween(function () {
              const tween = d3.interpolateNumber(
                parseInt((value.textContent ?? '0').split(' ').join('')) || 0,
                d.value ?? 0
              );

              return (t) => {
                return toDigitGrouped(tween(t).toFixed());
              };
            });
          if (d.height > 0 || x + width < d.x1 - d.x0 - 40) {
            value.setAttribute('dx', '4');
            value.setAttribute('y', '20');
          } else {
            value.setAttribute('x', `4`);
            value.setAttribute('dy', `20`);
          }
        });
    };

    onMounted(() => {
      if (!el.value) {
        throw new Error(`CollectionTagTreemap: missing element`);
      }
      const stop = addResizeListener(
        el.value,
        throttle((e) => {
          width.value = e.contentRect.width - 40;
        }, 100)
      );
      width.value = el.value.clientWidth;
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
      tree,
    };
  },
});
</script>
