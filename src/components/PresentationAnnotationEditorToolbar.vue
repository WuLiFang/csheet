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
        FaIcon(name="eye-slash")
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
        FaIcon(name="mouse-pointer")
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
        FaIcon(name="pen")
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
        FaIcon(name="regular/square")
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
        FaIcon(name="regular/circle")
      button.form-button(
        type="button"
        class="h-8 w-12 px-0 m-px"
        class="inline-flex flex-center text-lg font-serif"
        :class=`{
          'text-gray-500': parent.currentPainter !== "text"
        }`
        @click="parent.setPainter('text')"
        title='文本工具（快捷键：y）'
      ) T
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
          FaIcon(name="circle"
            class="h-4 algin-top"
          )
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
          FaIcon(name="text-height"
            class="h-4 algin-top"
          )
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
          FaIcon(name="trash-alt")
    div(
      v-show="parent.currentPainter !== 'null'"
      class="inline-flex justify-end m-px"
    )
      span(v-if="parent.loadingCount > 0")
        FaIcon.h-full(name="spinner" spin)
      button.form-button(
        type="button"
        class="h-8 m-px"
        class="inline-flex flex-center"
        @click="parent.editor.undo()"
        :disabled="parent.loadingCount > 0 || !parent.canUndo"
        title="撤销（快捷键：Ctrl + z）"
      )
        FaIcon(name="undo")
      button.form-button(
        type="button"
        class="h-8 m-px"
        class="inline-flex flex-center"
        :disabled="parent.loadingCount > 0 || !parent.canRedo"
        @click="parent.editor.redo()"
        title="重做（快捷键：Ctrl + y）"
      )
        FaIcon(name="redo")
    slot(name="right")
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import PresentationAnnotationEditor from './PresentationAnnotationEditor.vue';
import 'vue-awesome/icons/undo';
import 'vue-awesome/icons/redo';
import 'vue-awesome/icons/mouse-pointer';
import 'vue-awesome/icons/pen';
import 'vue-awesome/icons/eraser';
import 'vue-awesome/icons/eye-slash';
import 'vue-awesome/icons/regular/square';
import 'vue-awesome/icons/regular/circle';
import 'vue-awesome/icons/circle';
import 'vue-awesome/icons/text-height';
import 'vue-awesome/icons/trash-alt';
import SelectPainter from '@/svg-editor/painters/select';

@Component<PresentationAnnotationEditorToolbar>({})
export default class PresentationAnnotationEditorToolbar extends Vue {
  @Prop({ type: Object, required: true })
  parent!: PresentationAnnotationEditor;

  removeSelected(): void {
    const painter = this.parent.editor.painter;
    if (painter instanceof SelectPainter && painter.selected >= 0) {
      this.parent.editor.clearHistory();
      this.parent.editor.operation(painter.selected)?.remove();
      painter.selected = -1;
      this.parent.debouncedSubmit()
    }
  }

  get frameRangeInputVisible(): boolean {
    return (
      this.parent.presentation?.type === "video" &&
      (['select', 'polyline', 'ellipse', 'rectangle', 'text'].includes(
        this.parent.currentPainter
      ))
    );
  }

  get frameRangeInputDisabled(): boolean {
    return !(
      (['polyline', 'ellipse', 'rectangle', 'text'].includes(
        this.parent.currentPainter
      ) ||
        (this.parent.currentPainter === 'select' && this.parent.selected >= 0))
    );
  }
}
</script>
