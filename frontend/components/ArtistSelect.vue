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

import FaIcon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/users';

import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { Option as ElOption, Select as ElSelect } from 'element-ui';

export default Vue.extend({
  components: {
    ElOption,
    ElSelect,
    FaIcon,
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
  props: {
    placeholder: { type: String },
    size: { type: String },
    value: { type: Array as () => string[] },
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
