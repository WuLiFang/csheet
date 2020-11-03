<template lang="pug">
  RadioOrSelect(
    v-model="$_value"
    :options="options"
    required
  )
    option(value="leader") 组长
    option(value="director") 导演
    option(value="client") 客户
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import getVModelMixin from '@/mixins/VModelMixinV2';
import { RadioOrSelectOption } from '@/components/global/RadioOrSelect.vue';

@Component<CGTeamworkStageSelect>({})
export default class CGTeamworkStageSelect extends Mixins(
  getVModelMixin<string>()
) {
  options: RadioOrSelectOption[] = [
    { value: 'leader', label: '组长' },
    { value: 'director', label: '导演' },
    { value: 'client', label: '客户' },
  ];
}
</script>
