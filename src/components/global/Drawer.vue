<template lang="pug">
  .drawer(
    class="fixed inset-0 z-20"
  )
    transition(
      appear
      enter-class="opacity-0"
      leave-to-class="opacity-0"
      enter-active-class="transition-all duration-300 ease-in-out"
      leave-active-class="transition-all duration-300 ease-in-out"
    )
      .overlay(
        class="z-0 absolute inset-0 bg-secondary bg-opacity-50"
        @click="$emit('update:visible', false)"
        v-if="visible"
      )
    transition(
      appear
      enter-class="transform translate-x-full"
      leave-to-class="transform translate-x-full"
      enter-active-class="transition-all duration-300 ease-in-out"
      leave-active-class="transition-all duration-300 ease-in-out"
      @after-leave="$emit('close')"
      @after-enter="$emit('after-enter')"
    )
      .container(
        class="z-10 absolute m-auto bg-primary h-screen right-0"
        class="sm:px-4 overflow-y-auto overflow-x-hidden"
        :class="containerClass"
        v-if="visible"
      )
        slot(name="header")
          header(
            class="abosolute flex items-center sm:py-2 sticky bg-primary top-0 z-20"
          )
            button.form-button(
              type="button"
              @click="$emit('update:visible', false)"
            )
              FaIcon(name="arrow-left")
            h1.inline-block(
              class="text-lg sm:text-xl font-semibold mx-2"
            )
              slot(name="title")
        slot
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import "vue-awesome/icons/arrow-left";


@Component<Drawer>({})
export default class Drawer extends Vue {
  @Prop({ type: Boolean, required: true })
  visible!: boolean;

  @Prop({ type: String, default: "max-w-xl" })
  containerClass?: string;
}
</script>
