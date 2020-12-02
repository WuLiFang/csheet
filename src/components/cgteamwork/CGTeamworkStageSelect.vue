<template lang="pug">
  Radio(
    v-model="$_value"
    :options="options"
    required
  )
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
