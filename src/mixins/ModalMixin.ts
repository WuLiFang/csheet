import { Component, Prop, Vue } from 'vue-property-decorator';

/**
 * Mixin for support `modal.show`
 */
@Component
export class ModalMixin extends Vue {
  @Prop({ default: false, type: Boolean })
  public visible!: boolean;

  public get $_visible(): boolean {
    return this.visible;
  }

  public set $_visible(v: boolean) {
    this.$emit('update:visible', v);
  }
}
