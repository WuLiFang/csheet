<template lang="pug">
  ElSelect.tag-filter(
    v-model='result'
    :size='size'
    prefix-icon='el-icon-edit-outline'
    :placeholder='placeholder' 
    multiple
    filterable
    allow-create
  )
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
import { tagComputedMinxin } from '@/store/tag';
import { TagResponse } from '@/interface';
import { TagCreateActionPayload, TAG } from '@/mutation-types';

export default Vue.extend({
  components: {
    ElSelect,
    ElOption,
  },
  props: {
    value: { type: <() => string[]>Array },
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
