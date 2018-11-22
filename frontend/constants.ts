import { getDataFromAppElement } from './datatools';
import { isFileProtocol } from './packtools';

export const PAGE_ID = getDataFromAppElement('id', '');
export const IS_FILE_PROTOCOL = window.location.protocol === 'file:';
export const USERNAME = IS_FILE_PROTOCOL
  ? ''
  : getDataFromAppElement('username', '');
export const PAGE_PATH = getDataFromAppElement('path');
