<template lang="pug">
  ElSelect.tag-select(
    v-model='result'
    multiple
    filterable
    prefix-icon='el-icon-edit-outline'
    :size='size'
    :placeholder='placeholder' 
    :allow-create='allowCreate'
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

import {
  Select as ElSelect,
  Option as ElOption,
  Message,
  Notification,
} from 'element-ui';
// @ts-ignore
import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/tags';

import { tagComputedMinxin } from '@/store/tag';
import { TagResponse } from '@/interface';
import { TagCreateActionPayload, TAG } from '@/mutation-types';
import { isUndefined } from 'util';

export default Vue.extend({
  components: {
    ElSelect,
    ElOption,
    FaIcon,
  },
  props: {
    value: { type: Array as () => string[] },
    size: { default: 'mini' },
    allowCreate: { default: false },
    placeholder: { default: '选择或创建标签' },
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
        const created = value.filter(i => isUndefined(this.tagStoreByText[i]));
        const message = created.join(',');
        Promise.all(
          created.map(i => {
            const payload: TagCreateActionPayload = { data: { text: i } };
            return this.$store.dispatch(TAG.CREATE, payload);
          }),
        )
          .then(() => {
            this.$emit('input', value);
            if (message) {
              Notification({
                title: '成功添加了标签',
                message,
                type: 'success',
              });
            }
          })
          .catch(() => {
            Notification({ title: '创建标签失败', message, type: 'error' });
          });
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
