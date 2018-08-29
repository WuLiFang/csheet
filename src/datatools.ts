import Cookies from 'js-cookie';
import { isUndefined } from 'util';
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

export function getCookie(name: string, defaultValue = '') {
  const value = Cookies.get(name);
  if (isUndefined(value)) {
    return defaultValue;
  }
  return decodeURIComponent(
    value
      .replace(/%/g, '%25')
      .replace(/\\\\/g, '%5C')
      .replace(
        /\\(\d{3})/g,
        (match, str) => `%${parseInt(str, 8).toString(16)}`,
      ),
  );
}

export function buildURL(
  pathname: string,
  queryParameters: { [name: string]: string },
) {
  return [
    pathname,
    Object.entries(queryParameters)
      .map(item => item.map(encodeURIComponent).join('='))
      .join('&'),
  ].join('?');
}
