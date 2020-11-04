<script lang="ts">
import Vue from 'vue';
import { RenderlessMixin } from '@/mixins/RenderlessMixin';
export default Vue.extend({
  name: "LocalStorage",
  mixins: [RenderlessMixin],
  props: {
    name: { type: String, required: true },
    value: { type: String, default: '' },
  },
  mounted() {
    this.$emit('input', localStorage.getItem(this.name) ?? '');
    this.$watch(
      () => this.value,
      v => {
        localStorage.setItem(this.name, v);
      }
    );
  },
});
</script>
