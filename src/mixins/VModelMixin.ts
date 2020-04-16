import { Component, Prop, Vue } from 'vue-property-decorator';

/**
 * Mixin for support `v-model` directive with a `$_value` accessor
 */
@Component
export class VModelMixin<T> extends Vue {
  @Prop()
  value?: T;

  /**
   * Wrapped `value` prop for internal use
   */
  get $_value(): T | undefined {
    return this.value;
  }

  set $_value(value: T | undefined) {
    this.$emit('input', value);
  }
}
