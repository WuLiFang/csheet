<script lang="ts">
import Vue from 'vue';
import { RenderlessMixin } from '@/mixins/RenderlessMixin';
export default Vue.extend({
  name: 'LocalStorage',
  mixins: [RenderlessMixin],
  props: {
    name: { type: String, required: true },
    // eslint-disable-next-line vue/require-prop-types
    value: { default: undefined as unknown },
  },
  mounted() {
    const v = localStorage.getItem(this.name);
    if (v) {
      try {
        this.$emit('input', JSON.parse(v));
      } catch {
        // not json encoded
        this.$emit('input', v);
      }
    }
    this.$watch(
      () => this.value,
      v => {
        if (v == null) {
          localStorage.removeItem(this.name);
        } else {
          localStorage.setItem(this.name, JSON.stringify(v));
        }
      }
    );
  },
});
</script>
