<template lang="pug">
  transition
    slot
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
@Component({})
export default class FadeTransition extends Vue {}
</script>

<style lang="scss" scoped>
.v-enter-active,
.v-leave-active {
  transition: 0.2s ease-in-out;
}
.v-enter,
.v-leave-to {
  opacity: 0;
}
</style>
