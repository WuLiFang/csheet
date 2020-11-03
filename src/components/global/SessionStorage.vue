<script lang="ts">
import Vue from 'vue';
import { RenderlessMixin } from '@/mixins/RenderlessMixin';
export default Vue.extend({
  name: "SessionStorage",
  mixins: [RenderlessMixin],
  props: {
    name: { type: String, required: true },
    value: { type: String, default: '' },
  },
  mounted() {
    this.$emit('input', sessionStorage.getItem(this.name) ?? '');
    this.$watch(
      () => this.value,
      v => {
        sessionStorage.setItem(this.name, v);
      }
    );
  },
});
</script>
