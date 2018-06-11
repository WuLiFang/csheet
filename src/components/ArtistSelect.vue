<template lang="pug">
  ElSelect.artist-select(
    v-model='result'
    multiple
    filterable
    :size='size'
    :placeholder='placeholder'
  )
    i.prefix(slot='prefix')
      FaIcon.icon(name='users')
    ElOption(
    v-for='i in artists'
    :key='i'
    :label='i'
    :value='i')
  
</template>

<script lang="ts">
import Vue from 'vue';

// @ts-ignore
import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/users';

import { Select as ElSelect, Option as ElOption } from 'element-ui';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';

export default Vue.extend({
  components: {
    ElSelect,
    ElOption,
    FaIcon,
  },
  props: {
    value: { type: Array as () => string[] },
    size: { type: String },
    placeholder: { type: String },
  },
  computed: {
    ...CGTeamWorkTaskComputedMixin,
    result: {
      get(): string[] {
        return this.value;
      },
      set(value: string[]) {
        this.$emit('input', value);
      },
    },
  },
});
</script>
<style lang="scss">
.artist-select {
  .prefix {
    height: 100%;
    display: inline-flex;
    position: absolute;
    align-items: center;
    width: 25px;
    left: 5px;
    .icon {
      flex: 0 1 auto;
    }
  }
}
</style>
