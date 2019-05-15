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
import { ITagCreateActionPayload, TAG } from '@/mutation-types';
import { tagComputedMixin } from '@/store/tag';
import _ from 'lodash';
import Vue from 'vue';

import {
  Notification,
  Option as ElOption,
  Select as ElSelect,
} from 'element-ui';
import { default as FaIcon } from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/tags';

export default Vue.extend({
  components: {
    ElOption,
    ElSelect,
    FaIcon,
  },
  props: {
    allowCreate: { default: false },
    placeholder: { default: '选择或创建标签' },
    size: { default: 'mini' },
    value: { type: Array as () => string[] },
  },

  data() {
    return {};
  },

  computed: {
    ...tagComputedMixin,
    result: {
      get(): string[] {
        return this.value;
      },
      set(value: string[]) {
        const created = value.filter(
          i => this.ITagStoreByText[i] === undefined
        );
        const message = created.join(',');
        Promise.all(
          created.map(i => {
            const payload: ITagCreateActionPayload = { data: { text: i } };
            return this.$store.dispatch(TAG.CREATE, payload);
          })
        )
          .then(() => {
            this.$emit('input', value);
            if (message) {
              Notification({
                message,
                title: '成功创建了标签',
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
