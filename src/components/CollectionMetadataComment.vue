<template lang="pug">
  component(
    :is="tag"
  )
    template(v-if="hasFocus")
      textarea(
        ref="textarea"
        class="form-textarea w-full"
        v-model="localValue"
        @blur="blur()"
        @change="submit()"
        @input="debouncedSubmit()"
      )
      p.text-gray-500 {{ statusText }}
    template(v-else)
      textarea(
        ref="textarea"
        class="form-textarea w-full"
        @focus="focus()"
        placeholder="输入此收藏的公共留言信息"
        :value="remoteValue"
      )
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Collection } from '../graphql/types/Collection';
import { debounce } from 'lodash';
import mutations from '@/graphql/mutations';

const METADATA_KEY = 'comment';

@Component<CollectionMetadataComment>({
  mounted() {
    this.$nextTick(() => this.autoGrow());
    this.$watch(
      () => [this.remoteValue, this.localValue, this.value.id],
      () => {
        this.$nextTick(() => this.autoGrow());
      },
      { immediate: true }
    );
    this.$watch(
      () => this.remoteValue,
      n => {
        this.localValue = n;
      },
      { immediate: true }
    );
  },
  data() {
    return {
      debouncedSubmit: debounce(() => this.submit(), 1000),
    };
  },
})
export default class CollectionMetadataComment extends Vue {
  @Prop({ type: Object, required: true })
  value!: Collection;

  @Prop({ type: String, default: 'div' })
  tag!: string;

  localValue = '';
  hasFocus = false;
  loadingCount = 0;

  $refs!: {
    textarea: HTMLTextAreaElement;
  };

  autoGrow(): void {
    const el = this.$refs.textarea;
    if (!el) {
      return;
    }
    if (el.scrollHeight > el.clientHeight) {
      el.style.height = el.scrollHeight + 'px';
    }
  }

  get remoteValue(): string {
    return this.value.metadata.find(i => i.k === METADATA_KEY)?.v || '';
  }

  async submit(): Promise<void> {
    if (this.localValue === this.remoteValue) {
      return;
    }
    this.loadingCount += 1;
    try {
      await mutations.updateCollectionMetadata({
        input: {
          data: [
            {
              id: this.value.id,
              key: METADATA_KEY,
              value: this.localValue,
            },
          ],
        },
      });
    } finally {
      this.loadingCount -= 1;
    }
  }

  get statusText(): string {
    if (this.loadingCount > 0) {
      return '正在保存……';
    }
    if (this.remoteValue === this.localValue) {
      return '已保存';
    }
    return '即将自动保存';
  }

  focus(): void {
    this.hasFocus = true;
  }

  blur(): void {
    this.hasFocus = false;
  }
}
</script>
