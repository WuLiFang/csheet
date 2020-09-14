<template lang="pug">
  .inline-block(
    class="relative w-48 text-left"
  )
    input(
      tabindex="0"
      class="opacity-0 absolute inset-0 pointer-events-none"
      ref="validationInput"
      @invalid="focus()"
      aria-hidden
    )
    template(v-if="hasFocus")
      input(
        ref="queryInput"
        type="search"
        class="form-input w-full"
        v-model="query"
        placeholder="搜索项目"
        @blur="blur()"
        @keydown.enter.stop="$_value = highlight; blur()"
        @keydown.up.stop="selectHighlight(-1)"
        @keydown.down.stop="selectHighlight(1)"
      )
    template(v-else)
      output.inline-block(
        tabindex="0"
        class="form-select cursor-pointer w-full"
        @focus="focus()"
      ) 
        span {{ selected ? selected.name : '' }}
        .text-gray-500(v-if="!selected") 请选择项目
    transition(
      enter-active-class="transition ease-out duration-100"
      enter-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-out duration-75"
      leave-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    )
      div(
        class="origin-top-right absolute right-0 mt-4 w-64 border border-gray-700"
        class="rounded shadow-lg bg-gray-800"
        aria-orientation="vertical"
        v-show="hasFocus"
        role="menu"
      )
        ol(
          class="max-h-96 overflow-y-auto"
        )
          template(
            v-if="loadingCount > 0"
          )
            .text-center.m-2.text-gray-500
              FaIcon.h-16(name="spinner" spin)
          template(v-else)
            template(v-for="i in projects")
              li
                Option(
                  ref="option"
                  :data-value="i.database"
                  class="p-2"
                  :class=`{
                    "bg-blue-500": highlight == i.database,
                  }`
                  @mouseenter="highlight = i.database"
                  :value="i"
                  @click="$_value = i.database; blur()"
                )
            div(
              v-if="projects.length === 0"
              class="text-gray-500 text-center text-md p-2"
            ) 无匹配项目 
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import getVModelMixin from '../../mixins/VModelMixinV2';
import {
  cgteamworkProjects,
  cgteamworkProjects_cgteamworkProjects as Project,
  cgteamworkProjectsVariables,
} from '../../graphql/types/cgteamworkProjects';
import { orderBy } from 'lodash';
import Option from './CGTeamworkProjectSelectOption.vue';

const statusOrder = ['CLOSE', 'APPROVE', 'WORK', 'ACTIVE'];

@Component<CGTeamworkProjectSelect>({
  components: { Option },
  apollo: {
    projects: {
      query: require('@/graphql/queries/cgteamworkProjects.gql'),
      variables(): cgteamworkProjectsVariables {
        return {
          q: this.query || undefined,
          status: this.query ? undefined : ['Active'],
        };
      },
      update(v: cgteamworkProjects): Project[] {
        return orderBy(
          v.cgteamworkProjects ?? [],
          [i => statusOrder.indexOf(i.status.toUpperCase()), i => i.name],
          ['desc', 'asc']
        );
      },
    },
  },
  mounted() {
    this.$watch(
      () => this.value,
      n => {
        if (this.required && !n) {
          this.$refs.validationInput.setCustomValidity('请选择项目');
        } else {
          this.$refs.validationInput.setCustomValidity('');
        }
      },
      { immediate: true }
    );
    this.$watch(
      () => this.hasFocus,
      n => {
        if (n) {
          this.$refs.queryInput.focus();
          this.highlight = this.value;
          this.scrollToHighlight();
        }
      }
    );
    this.$watch(
      () => this.projects,
      () => {
        this.selectHighlight();
      }
    );
  },
})
export default class CGTeamworkProjectSelect extends Mixins(
  getVModelMixin<string>()
) {
  @Prop({ type: Boolean, default: false })
  required!: boolean;

  $el!: HTMLDivElement;
  $refs!: {
    queryInput: HTMLInputElement;
    validationInput: HTMLInputElement;
    option: HTMLDivElement[];
  };

  projects?: Project[];
  query = '';
  highlight = '';
  hasFocus = false;
  loadingCount = 0;

  get selected(): Project | undefined {
    return this.projects?.find(i => i.database === this.$_value);
  }

  selectHighlight(offset = 0): void {
    if (!this.projects) {
      return;
    }
    let index = this.projects.findIndex(i => i.database === this.highlight);
    index += offset;
    if (index < 0) {
      index = 0;
    }
    if (index > this.projects.length - 1) {
      index = this.projects.length - 1;
    }
    const v = this.projects[index];
    if (!v) {
      return;
    }
    this.$_value = v.database;
  }

  scrollToHighlight(): void {
    this.$refs.option
      .find(i => i.dataset.value === this.highlight)
      ?.scrollIntoView({
        block: 'nearest',
      });
  }

  focus(): void {
    this.hasFocus = true;
    this.highlight = this.$_value;
    this.scrollToHighlight();
  }

  blur(): void {
    this.hasFocus = false;
  }
}
</script>
