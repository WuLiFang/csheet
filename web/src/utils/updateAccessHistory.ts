import store from '@/store';
import { IVideoState } from '@/store/types';
import { compact } from 'lodash';

import * as accessHistory from '@/access-history';
export async function updateAccessHistory(): Promise<void> {
  const videos = compact(
    Object.values((store.modules.videoStore.state as IVideoState).storage)
  );
  const imageCount = videos.reduce(
    (a, b) => a + (b.poster && b.poster_mtime ? 1 : 0),
    0
  );
  const videoCount = videos.reduce(
    (a, b) => a + (b.src && b.src_mtime ? 1 : 0),
    0
  );

  const itemCount = videos.length;
  const params = new URL(location.href).searchParams;
  accessHistory.push({
    counts: {
      image: imageCount,
      item: itemCount,
      video: videoCount,
    },
    href: location.href,
    type: params.has('root') ? 'local' : 'cgteamwork',
  });
}
