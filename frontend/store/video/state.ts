import { getDataFromAppElement } from '@/datatools';
import { IVideoResponse } from '@/interface';
import { IVideoState } from '@/store/types';

function parseDataFromPage(): IVideoState['storage'] {
  const parsed = JSON.parse(
    getDataFromAppElement('video', '[]')
  ) as IVideoResponse[];
  const ret: IVideoState['storage'] = {};
  parsed.forEach(value => {
    ret[value.uuid] = value;
  });
  return ret;
}

export const state: IVideoState = {
  blobURLMap: {},
  blobWhiteListMap: new Map<string, string[]>(),
  selectStateMap: {},
  storage: parseDataFromPage(),
  visibleVideos: [],
};

export default state;
