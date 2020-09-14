import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
class VModelMixin<T> extends Vue {
  @Prop()
  value!: T;

  normalizeValue(v: T): T {
    return v;
  }

  get $_value(): T {
    return this.normalizeValue(this.value);
  }

  set $_value(value: T) {
    const ret = this.normalizeValue(value);
    if (ret === this.$_value) {
      // skip event if not changed
      return;
    }
    this.$emit('input', ret);
  }
}

/**
 * Create mixin for support `v-model` directive with a `$_value` accessor
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function getVModelMixin<T>(): typeof VModelMixin &
  (new () => VModelMixin<T>) {
  return VModelMixin;
}
