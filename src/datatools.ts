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
