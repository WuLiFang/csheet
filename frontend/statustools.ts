import { TaskStatusText } from '@/interface';

export function taskStatusTextL10n(text: TaskStatusText): string {
  return {
    Approve: '通过',
    Check: '检查',
    Close: '关闭',
    Retake: '返修',
    Unset: '默认',
    Wait: '等待',
  }[text];
}
