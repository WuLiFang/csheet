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
import { Entry } from '@/components/global/entry';

@Component<CGTeamworkStageSelect>({})
export default class CGTeamworkStageSelect extends Mixins(
  getVModelMixin<string>()
) {
  options: Entry<string>[] = [
    { key: 'leader', value: 'leader', label: '组长' },
    { key: 'director', value: 'director', label: '导演' },
    { key: 'client', value: 'client', label: '客户' },
  ];
}
</script>
