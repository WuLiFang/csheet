<template lang="pug">
  .presentation-annotation-editor-toolbar(
    class="flex flex-wrap justify-between"
  )
    div(
      class="inline-flex flex-center my-px flex-wrap"
    )
      button.form-button(
        type="button"
        class="h-8 w-12 px-0 m-px"
        class="inline-flex flex-center"
        :class=`{
          'text-gray-500': parent.currentPainter !== "null"
        }`
        @click="parent.setPainter('null')"
        title='隐藏标注（快捷键：q）'
      )
        svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
          path(:d="mdiEyeOff")
      button.form-button(
        type="button"
        class="h-8 w-12 px-0 m-px"
        class="inline-flex flex-center"
        :class=`{
          'text-gray-500': parent.currentPainter !== "select"
        }`
        @click="parent.setPainter('select')"
        title='选择工具（快捷键：w）'
      )
        svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
          path(:d="mdiCursorDefault")
      button.form-button(
        type="button"
        class="h-8 w-12 px-0 m-px"
        class="inline-flex flex-center"
        :class=`{
          'text-gray-500': parent.currentPainter !== "polyline"
        }`
        @click="parent.setPainter('polyline')"
        title='铅笔工具（快捷键：e）'
      )
        svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
          path(:d="mdiPencil")
      button.form-button(
        type="button"
        class="h-8 w-12 px-0 m-px"
        class="inline-flex flex-center"
        :class=`{
          'text-gray-500': parent.currentPainter !== "rectangle"
        }`
        @click="parent.setPainter('rectangle')"
        title='矩形工具（快捷键：r）'
      )
        svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
          path(:d="mdiSquareOutline")
      button.form-button(
        type="button"
        class="h-8 w-12 px-0 m-px"
        class="inline-flex flex-center"
        :class=`{
          'text-gray-500': parent.currentPainter !== "ellipse"
        }`
        @click="parent.setPainter('ellipse')"
        title='椭圆工具（快捷键：t）'
      ) 
        svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
          path(:d="mdiCircleOutline")
      button.form-button(
        type="button"
        class="h-8 w-12 px-0 m-px"
        class="inline-flex flex-center text-lg font-serif"
        :class=`{
          'text-gray-500': parent.currentPainter !== "text"
        }`
        @click="parent.setPainter('text')"
        title='文本工具（快捷键：y）'
      )
        svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
          path(:d="mdiFormatText")
    div(
      class="inline-flex flex-wrap"
      class="flex-auto mx-1 my-px text-left"
    )
      div(
        v-if="frameRangeInputVisible"
        :disabled="frameRangeInputDisabled"
        class="m-px"
      )
        label 帧范围
          select.form-select(
            class="w-24 h-8 p-0 px-2 text-sm"
            v-model="parent.config.frameRangeMode"
            
          )
            option(value="NULL") 不限
            option(value="CURRENT") 当前帧
            option(value="GTE_CURRENT") 当前至结束
            option(value="LTE_CURRENT") 起始至当前
            option(value="INPUT") 指定范围
        template(v-if="parent.config.frameRangeMode === 'INPUT'")
          InputNumber.form-input(
            v-model="parent.config.firstFrame"
            class="w-20 h-8"
            placeholder="首帧"
          )
          span -
          InputNumber.form-input(
            v-model="parent.config.lastFrame"
            class="w-20 h-8"
            placeholder="末帧"
          )
      template(v-if="['polyline', 'rectangle', 'ellipse', 'text'].includes(parent.currentPainter)")
        input.form-input(
          type="color"
          class="h-8 w-8 p-0 m-px"
          v-model="parent.config.color"
          title="颜色"
        )
      template(v-if="['text'].includes(parent.currentPainter)")
        input.form-input(
          type="color"
          class="h-8 w-8 p-0 m-px"
          v-model="parent.config.backgroundColor"
          title="背景颜色"
        )
      template(v-if="['polyline', 'eraser', 'rectangle', 'ellipse'].includes(parent.currentPainter)")
        label(
          class="inline-flex items-center m-px"
        )
          svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
            path(:d="mdiCircle")
          InputNumber.form-input(
            class="w-20 h-8 text-center"
            v-model="parent.config.strokeWidth"
            :min="1"
            title="描边粗细"
          )
      template(v-if="['text'].includes(parent.currentPainter)")
        label(
          class="inline-flex items-center m-px"
        )
          svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
            path(:d="mdiFormatSize")
          InputNumber.form-input(
            class="h-8 w-20"
            v-model="parent.config.fontSize"
            :min="12"
            title="文本大小"
          )
      template(v-if="['select'].includes(parent.currentPainter)")
        button.form-button(
          class="h-8"
          class="inline-flex flex-center m-px"
          :disabled='parent.selected < 0'
          @click='removeSelected()'
          title="删除所选"
        ) 
          svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
            path(:d="mdiDelete")
    div(
      v-show="parent.currentPainter !== 'null'"
      class="inline-flex justify-end m-px items-center"
    )
      template(v-if="parent.loadingCount > 0")
        svg(class="inline fill-current h-8 animate-spin" viewBox="0 0 24 24")
          path(:d="mdiLoading")
      button.form-button(
        type="button"
        class="h-8 m-px px-0 w-12"
        class="inline-flex flex-center"
        @click="parent.editor.undo()"
        :disabled="parent.loadingCount > 0 || !parent.canUndo"
        title="撤销（快捷键：Ctrl + z）"
      )
        svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
          path(:d="mdiUndo")
      button.form-button(
        type="button"
        class="h-8 m-px px-0 w-12"
        class="inline-flex flex-center"
        :disabled="parent.loadingCount > 0 || !parent.canRedo"
        @click="parent.editor.redo()"
        title="重做（快捷键：Ctrl + y）"
      )
        svg(class="inline-block fill-current h-6" viewBox="0 0 24 24")
          path(:d="mdiRedo")
    slot(name="right")
</template>

<script lang="ts">
import SelectPainter from '@/svg-editor/painters/select';
import {
  mdiCircle,
  mdiCircleOutline,
  mdiCursorDefault,
  mdiDelete,
  mdiEyeOff,
  mdiFormatSize,
  mdiFormatText,
  mdiLoading,
  mdiPencil,
  mdiRedo,
  mdiSquareOutline,
  mdiUndo,
} from '@mdi/js';
import { Component, Prop, Vue } from 'vue-property-decorator';
import PresentationAnnotationEditor from './PresentationAnnotationEditor.vue';

@Component<PresentationAnnotationEditorToolbar>({
  data() {
    return {
      mdiCircleOutline,
      mdiCursorDefault,
      mdiEyeOff,
      mdiFormatText,
      mdiCircle,
      mdiPencil,
      mdiSquareOutline,
      mdiFormatSize,
      mdiDelete,
      mdiLoading,
      mdiUndo,
      mdiRedo,
    };
  },
})
export default class PresentationAnnotationEditorToolbar extends Vue {
  @Prop({ type: Object, required: true })
  parent!: PresentationAnnotationEditor;

  removeSelected(): void {
    const painter = this.parent.editor.painter;
    if (painter instanceof SelectPainter && painter.selected >= 0) {
      this.parent.editor.clearHistory();
      this.parent.editor.operation(painter.selected)?.remove();
      painter.selected = -1;
      this.parent.debouncedSubmit();
    }
  }

  get frameRangeInputVisible(): boolean {
    return (
      this.parent.presentation?.type === 'video' &&
      ['select', 'polyline', 'ellipse', 'rectangle', 'text'].includes(
        this.parent.currentPainter
      )
    );
  }

  get frameRangeInputDisabled(): boolean {
    return !(
      ['polyline', 'ellipse', 'rectangle', 'text'].includes(
        this.parent.currentPainter
      ) ||
      (this.parent.currentPainter === 'select' && this.parent.selected >= 0)
    );
  }
}
</script>
