<template lang="pug">
  .drawer(
    class="fixed inset-0 z-20"
  )
    transition(
      enter-class="opacity-0"
      leave-to-class="opacity-0"
      enter-active-class="transition-all duration-300 ease-in-out"
      leave-active-class="transition-all duration-300 ease-in-out"
    )
      .overlay(
        class="z-0 absolute inset-0 bg-black bg-opacity-50"
        @click="$_visible = false"
        v-if="visible"
      )
    transition(
      enter-class="transform translate-x-full"
      leave-to-class="transform translate-x-full"
      enter-active-class="transition-all duration-300 ease-in-out"
      leave-active-class="transition-all duration-300 ease-in-out"
      @after-leave="$emit('close')"
      @after-enter="$emit('after-enter')"
    )
      .container(
        class="z-10 absolute m-auto bg-gray-800 h-screen max-w-lg right-0"
        class="sm:p-4"
        v-if="visible"
      )
        slot
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { ModalMixin } from '@/mixins/ModalMixin';

@Component<Drawer>({})
export default class Drawer extends Mixins(ModalMixin) {}
</script>
