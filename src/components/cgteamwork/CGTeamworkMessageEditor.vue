<template lang="pug">
  .cgteamwork-message-editor
    textarea.form-textarea(
      ref="textarea"
      class="w-full h-32"
      v-model="text"
      @blur="commit()"
      v-bind="$attrs"
      placeholder="输入备注，支持图片粘贴"
      @paste="handlePaste"
    )
    .flex.flex-wrap
      template(v-for="i, $index in images")
        CGteamworkEditorImagePreview(
          class="h-16 w-16 mr-1"
          class="inline-block bg-gray-600 rounded"
          :value="i"
          @close="images.splice($index, 1); commit()"
        )
      label(
        class="h-16 w-16 border border-dashed cursor-pointer"
        class="inline-flex flex-center rounded"
      )
        svg(
          class="fill-current h-8"
          viewBox="0 0 24 24"
        )
          path(:d="mdiPlus")
        input(type="file" accept="image/*" hidden @input="handleFileInput")
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import getVModelMixin from '@/mixins/VModelMixinV2';
import { debounce } from 'lodash';
import CGteamworkEditorImagePreview from '@/components/cgteamwork/CGTeamworkMessageEditorImagePreview.vue';
import { mdiPlus } from '@mdi/js';

export interface CGTeamworkMessageEditorValue {
  html: string;
  images: (File | Blob)[];
}

@Component<CGTeamworkMessageEditor>({
  inheritAttrs: false,
  components: {
    CGteamworkEditorImagePreview,
  },
  data() {
    return { mdiPlus };
  },
  mounted() {
    this.$root.$emit('viewer-screenshot', (v: Blob) => {
      this.images.push(v);
    });
    this.$watch(
      () => this.$_value,
      (v) => {
        this.text = v.html.replace(/<br>/g, '\n');
        this.images = v.images;
      },
      {
        immediate: true,
      }
    );
    this.$watch(
      () => this.text,
      debounce(() => this.commit(), 1e3)
    );
  },
})
export default class CGTeamworkMessageEditor extends Mixins(
  getVModelMixin<CGTeamworkMessageEditorValue>()
) {
  $refs!: {
    textarea: HTMLTextAreaElement;
  };

  text = '';
  images: (File | Blob)[] = [];

  commit(): void {
    this.$_value = {
      html: this.text.replace(/\n/g, '<br>'),
      images: this.images,
    };
  }

  focus(): void {
    this.$refs.textarea.focus();
  }

  protected handlePaste(e: ClipboardEvent): void {
    const files = e.clipboardData?.files;
    if (!files) {
      return;
    }
    for (let i = 0; i < files.length; i += 1) {
      const file = files.item(i);
      if (file && file.type.startsWith('image/')) {
        this.images.push(file);
      }
    }
  }

  protected handleFileInput(e: InputEvent): void {
    const el = e.target;
    if (!(el instanceof HTMLInputElement && el.files)) {
      return;
    }
    e.preventDefault();

    for (let i = 0; i < el.files.length; i++) {
      const f = el.files.item(i);
      if (!f) {
        break;
      }
      this.images.push(f);
    }
  }
}
</script>
