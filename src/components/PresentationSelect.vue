<template lang="pug">
  .presentation-select(
    class="flex w-full flex-wrap"
  )
    template(v-for="i in sortedOptions")
      button(
        class="flex-auto opacity-50 bg-gray-800 w-32"
        type="button"
        :class=`{
          'opacity-100': value === i.id
        }`
        @click="select(i.id)"
      ) 
        template(v-if="i.type === 'image'")
          FaIcon.w-full(name="image")
        template(v-else-if="i.type === 'video'")
          FaIcon.w-full(name="video")
        template(v-else)
          span {{i.type}}
        TimeWidget(:value="i.raw.modTime")
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { presentation as Presentation } from '../graphql/types/presentation';
import 'vue-awesome/icons/image';
import 'vue-awesome/icons/video';
import { sortBy } from 'lodash';
import * as preference from '@/preference';
import {
  presentationNode,
  presentationNodeVariables,
} from '@/graphql/types/presentationNode';
@Component<PresentationSelect>({})
export default class PresentationSelect extends Vue {
  @Prop({ type: String })
  value?: string;

  @Prop({ type: Array, required: true })
  options!: Presentation[];

  get sortedOptions() {
    return sortBy(this.options, [
      i => ['video', 'image'].findIndex(j => j === i.type),
      i => i.id,
    ]);
  }
  select(v: string) {
    if (this.value === v) {
      return;
    }
    const match = this.options.find(i => i.id === v);
    this.$emit('input', v);
    if (match) {
      preference.set('regularPreferredPresentation', match.type);
    }
  }

  @Watch('options', { immediate: true })
  autoSelect() {
    if (this.options.length == 0) {
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
          [
            preference.get('regularPreferredPresentation'),
            'video',
            'image',
          ].findIndex(j => j === i.type),
        i => i.id,
      ])[0]?.id
    );
  }
}
</script>
