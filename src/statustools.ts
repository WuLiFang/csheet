import { TaskStatusText } from '@/interface';

export function taskStatusTextL10n(text: TaskStatusText | null): string {
  if (!text) {
    return '未设置';
  }
  return {
    Close: '关闭',
    Wait: '等待',
    Check: '检查',
    Retake: '返修',
    Approve: '通过',
  }[text];
}
