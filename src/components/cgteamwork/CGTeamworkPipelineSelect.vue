<template lang="pug">
  .inline-block(
    class="relative w-48 text-left"
  )
    input(
      tabindex="-1"
      class="opacity-0 absolute inset-0 pointer-events-none"
      ref="validationInput"
      @invalid="focus()"
      aria-hidden
    )
    template(v-if="popupVisible")
      input(
        ref="queryInput"
        type="search"
        class="form-input w-full"
        v-model="query"
        placeholder="搜索流程"
        @blur="blur()"
        @keydown.enter.stop="$_value = highlight; blur();"
        @keydown.up.stop="selectHighlight(-1)"
        @keydown.down.stop="selectHighlight(1)"
      )
    template(v-else)
      output.inline-block(
        tabindex="0"
        class="form-select cursor-pointer w-full"
        @focus="focus()"
      ) 
        span &#8203;
        span(v-if="selected") {{ selected.name }}
        span.absolute.inset-0.flex.items-center.justify-center(v-else-if="loadingCount > 0") 
          FaIcon.text-gray-500(name="spinner" spin)
        span.text-gray-500(v-else) 请选择流程
    transition(
      enter-active-class="transition ease-out duration-100"
      enter-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-out duration-75"
      leave-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    )
      ol(
        class="origin-top-right absolute right-0 mt-4 w-64 border border-gray-700"
        class="rounded shadow-lg bg-gray-800"
        class="max-h-96 overflow-y-auto"
        aria-orientation="vertical"
        v-show="popupVisible"
        role="menu"
      )
        template(v-for="i in pipelines")
          Option(
            :key="i.name"
            tag="li"
            ref="option"
            :data-value="i.name"
            class="p-2 cursor-pointer"
            :class=`{
              "bg-blue-500": highlight == i.name,
            }`
            @mouseenter="highlight = i.name"
            :value="i"
            @click="$_value = i.name; blur();"
          )
        template(
          v-if="pipelines.length === 0"
        )
          .text-gray-500.text-center.text-md.p-2
            template(v-if="loadingCount > 0") 
              FaIcon.h-16(name="spinner" spin)
            template(v-else)
              span 无匹配流程
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import getVModelMixin from '../../mixins/VModelMixinV2';
import {
  cgteamworkPipelines,
  cgteamworkPipelines_cgteamworkPipelines as Pipeline,
  cgteamworkPipelinesVariables,
} from '../../graphql/types/cgteamworkpipelines';
import { uniqBy, sortBy } from 'lodash';
import Option from './CGTeamworkPipelineSelectOption.vue';

@Component<CGTeamworkPipelineSelect>({
  components: { Option },
  apollo: {
    matchedpipelines: {
      query: require('@/graphql/queries/cgteamworkPipelines.gql'),
      variables(): cgteamworkPipelinesVariables {
        return {
          q: this.query || undefined,
          database: this.database,
        };
      },
      update(v: cgteamworkPipelines): Pipeline[] {
        return v.cgteamworkPipelines ?? [];
      },
      skip(): boolean {
        return !this.database;
      },
    },
  },
  mounted() {
    this.$watch(
      () => this.value,
      (n, o) => {
        if (this.required && !n) {
          this.$refs.validationInput.setCustomValidity('请选择流程');
        } else {
          this.$refs.validationInput.setCustomValidity('');
        }
        if (o) {
          this.$emit('change');
        }
      },
      { immediate: true }
    );
  },
})
export default class CGTeamworkPipelineSelect extends Mixins(
  getVModelMixin<string>()
) {
  @Prop({ type: String, required: true })
  database!: string;

  @Prop({ type: Boolean, default: false })
  required!: boolean;

  $el!: HTMLDivElement;
  $refs!: {
    queryInput: HTMLInputElement;
    validationInput: HTMLInputElement;
    option: HTMLDivElement[];
  };

  matchedpipelines?: Pipeline[];
  selectedpipelines?: Pipeline[];
  popupVisible = false;

  get pipelines(): Pipeline[] {
    return sortBy(
      uniqBy(
        [
          ...(this.matchedpipelines ?? []),
          ...(this.query
            ? []
            : [
                {
                  __typename: 'CGTeamworkPipeline',
                  name: this.$_value,
                  description: '',
                  order: '',
                } as Pipeline,
              ]),
        ],
        i => i.name
      ),
      [i => i.order, i => i.name]
    );
  }

  query = '';
  highlight = '';
  hasFocus = false;
  loadingCount = 0;

  get selected(): Pipeline | undefined {
    return this.pipelines?.find(i => i.name === this.$_value);
  }

  scrollToHighlight(): void {
    this.$refs.option
      ?.find(i => i.dataset.value === this.highlight)
      ?.scrollIntoView({
        block: 'nearest',
      });
  }

  selectHighlight(offset = 0): void {
    if (!this.pipelines) {
      return;
    }
    let index = this.pipelines.findIndex(i => i.name === this.highlight);
    index += offset;
    if (index < 0) {
      index = 0;
    }
    if (index > this.pipelines.length - 1) {
      index = this.pipelines.length - 1;
    }
    const v = this.pipelines[index];
    if (!v) {
      return;
    }
    this.$_value = v.name;
    this.highlight = v.name;
    this.scrollToHighlight();
  }

  focus(): void {
    this.hasFocus = true;
    this.highlight = this.$_value;
    this.popupVisible = true;
    this.$nextTick(() => {
      this.scrollToHighlight();
      this.$refs.queryInput.focus();
    });
  }

  blur(): void {
    this.hasFocus = false;
    // delay popup hide so click event from popup can trigger.
    setTimeout(() => {
      if (this.hasFocus) {
        return;
      }
      this.popupVisible = false;
    }, 100);
    if (document.activeElement === this.$refs.queryInput) {
      this.$refs.queryInput.blur();
    }
  }
}
</script>
