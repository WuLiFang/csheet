import { getDataFromAppElement } from '@/datatools';
import { VideoResponse } from '@/interface';
import { VideoState } from '@/store/types';

function parseDataFromPage(): VideoState['storage'] {
  const parsed = JSON.parse(
    getDataFromAppElement('video', '[]')
  ) as VideoResponse[];
  const ret: VideoState['storage'] = {};
  parsed.forEach(value => {
    ret[value.uuid] = value;
  });
  return ret;
}

export const state: VideoState = {
  storage: parseDataFromPage(),
  blobURLMap: {},
  blobWhiteListMap: new Map<string, string[]>(),
  selectStateMap: {},
  visibleVideos: [],
};

export default state;
