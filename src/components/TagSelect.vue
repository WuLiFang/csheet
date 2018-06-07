<template lang="pug">
  ElSelect.tag-select(
    v-model='result'
    :size='size'
    prefix-icon='el-icon-edit-outline'
    :placeholder='placeholder' 
    multiple
    filterable
    allow-create
  )
    i.prefix(slot='prefix')
      FaIcon.icon(name='tags')
    ElOption(
      v-for='i in tags',
      :key='i.id'
      :value='i.text'
    )
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';

import { Select as ElSelect, Option as ElOption } from 'element-ui';
// @ts-ignore
import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/tags';

import { tagComputedMinxin } from '@/store/tag';
import { TagResponse } from '@/interface';
import { TagCreateActionPayload, TAG } from '@/mutation-types';

export default Vue.extend({
  components: {
    ElSelect,
    ElOption,
    FaIcon,
  },
  props: {
    value: { type: Array as () => string[] },
    size: { default: 'mini' },
    placeholder: { default: '选择标签' },
  },
  data() {
    return {};
  },
  computed: {
    ...tagComputedMinxin,
    result: {
      get(): string[] {
        return this.value;
      },
      set(value: string[]) {
        const created = _.difference(value, this.value);
        created.map(i => {
          const payload: TagCreateActionPayload = { data: { text: i } };
          this.$store.dispatch(TAG.CREATE, payload);
        });
        this.$emit('input', value);
      },
    },
  },
  methods: {},
});
</script>
<style lang="scss">
.tag-select {
  .prefix {
    height: 100%;
    display: inline-flex;
    position: absolute;
    align-items: center;
    width: 25px;
    left: 6px;
    .icon {
      flex: 0 1 auto;
    }
  }
}
</style>
