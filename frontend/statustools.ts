import { TaskStatusText } from '@/interface';

export function taskStatusTextL10n(text: TaskStatusText): string {
  return {
    Close: '关闭',
    Wait: '等待',
    Check: '检查',
    Retake: '返修',
    Approve: '通过',
    Unset: '默认',
  }[text];
}
