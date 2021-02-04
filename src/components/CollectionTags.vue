<template>
  <CollectionTagInput
    ref="tagInput"
    v-model="formData.tags"
    multiple
    input-class="text-sm"
    v-bind="$attrs"
    type="text"
    @input="submit()"
  />
</template>

<script lang="ts">
import CollectionTagInput from '@/components/CollectionTagInput.vue';
import mutations from '@/graphql/mutations';
import queries from '@/graphql/queries';
import equalSet from '@/utils/equalSet';
import {
  computed,
  defineComponent,
  reactive,
  ref,
  watch,
} from '@vue/composition-api';
import { info } from '@/message';

export default defineComponent({
  name: 'CollectionTags',
  inheritAttrs: false,
  components: {
    CollectionTagInput,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup: props => {
    const {
      node: collection,
      query: collectionQuery,
    } = queries.useCollectionNode(computed(() => ({ id: props.id })));
    const formData = reactive({
      tags: [] as string[],
    });
    const tags = computed(() => collection.value?.tags ?? []);
    watch(tags, v => {
      formData.tags = v;
    });
    const tagInput = ref<InstanceType<typeof CollectionTagInput> | undefined>();
    const loadingCount = ref(0);
    const isChanged = computed(
      () => !equalSet(new Set(formData.tags), new Set(tags.value))
    );
    return {
      collection,
      collectionQuery,
      tags,
      tagInput,
      loadingCount,
      formData,
      isChanged,
    };
  },
  methods: {
    async submit() {
      if (!this.isChanged) {
        return;
      }
      this.loadingCount += 1;
      try {
        await mutations.updateCollection({
          input: {
            data: [
              {
                id: this.id,
                tags: this.formData.tags,
              },
            ],
          },
        });
        this.$emit('submit');
        info('标签已更新');
      } finally {
        this.loadingCount -= 1;
      }
    },
  },
});
</script>
