<template>
  <div class="relative text-left inline-block">
    <slot />
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-out duration-75"
      leave-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="visible"
        class="origin-top-right absolute right-0 mt-px z-30 w-full"
        :class="[dropdownBaseClass, dropdownClass]"
      >
        <slot name="dropdown" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import defaults from '@/components/global/defaults';

export default defineComponent({
  name: 'Dropdown',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    dropdownBaseClass: {
      type: String,
      default: () => defaults.dropdown.baseClass,
    },
    dropdownClass: {
      type: String,
    },
  },
  setup: () => {
    return {};
  },
});
</script>
