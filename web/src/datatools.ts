import { TaskStatus } from '@/interface';

export function getDataFromAppElement(name: string, defaultValue?: any) {
  const app = document.getElementById('app');
  if (!app) {
    return defaultValue;
  }
  const data = app.dataset[name];
  if (!data) {
    return defaultValue;
  }
  return data;
}

export function buildURL(
  pathname: string,
  queryParameters: { [name: string]: string }
) {
  return [
    pathname,
    Object.entries(queryParameters)
      .map(item => item.map(encodeURIComponent).join('='))
      .join('&'),
  ].join('?');
}
export function parseTaskStatus(name: string): TaskStatus {
  let ret: TaskStatus = TaskStatus.Unset;
  switch (name) {
    case 'Approve':
      ret = TaskStatus.Approve;
      break;
    case 'Retake':
      ret = TaskStatus.Retake;
      break;
    case 'Check':
      ret = TaskStatus.Check;
      break;
    case 'Wait':
      ret = TaskStatus.Wait;
      break;
    case 'Close':
      ret = TaskStatus.Close;
      break;
    default:
      if (name) {
        throw new Error(`Unknown task status: ${name}`);
      }
  }
  return ret;
}
