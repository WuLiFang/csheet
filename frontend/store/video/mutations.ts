import { VideoState } from '@/store/types';
import Vue from 'vue';
import { MutationTree } from 'vuex';
import * as type from '../../mutation-types';

export const mutations: MutationTree<VideoState> = {
  [type.VIDEO.UPDATE](contextState, payload: type.VideoUpdateMutationPayload) {
    Vue.set(contextState.storage, payload.id, payload.data);
  },
  [type.UPDATE_BLOB_HUB](
    contextState,
    payload: type.UpdateBlobHubMutationPayload
  ) {
    Vue.set(
      contextState.blobURLMap,
      payload.url,
      URL.createObjectURL(payload.blob)
    );
  },
  [type.CLEAR_VIDEO_BLOB](contextState) {
    const whiteList: string[] = [];
    for (const value of contextState.blobWhiteListMap.values()) {
      if (value) {
        whiteList.push(...value);
      }
    }
    const exp = new RegExp('/video/.+/([^.?]+)');
    Object.keys(contextState.blobURLMap)
      .filter(i => {
        const match = i.match(exp);
        if (!match) {
          return true;
        }
        return !whiteList.includes(match[1]);
      })
      .forEach(i => {
        const url = contextState.blobURLMap[i];
        if (!url) {
          return;
        }
        URL.revokeObjectURL(url);
        Vue.delete(contextState.blobURLMap, i);
      });
  },
  [type.UPDATE_VIDEO_BLOB_WHITELIST](
    contextState,
    payload: type.VideoUpdateBlobWhiteListMapMutationPayload
  ) {
    contextState.blobWhiteListMap.set(payload.key, payload.value);
  },
  [type.VIDEOS_ADD_TAG](
    contextState,
    payload: type.VideosAddTagMutationsPayload
  ) {
    payload.videos.map(i => {
      const video = contextState.storage[i];
      if (!video) {
        return;
      }
      if (!video.tags.includes(payload.id)) {
        video.tags.push(payload.id);
      }
    });
  },
  [type.UPDATE_VIDEO_SELECT_STATE](
    contextState,
    payload: type.VideoUpdateSelectStateMutationPayload
  ) {
    Object.keys(payload).map(i =>
      Vue.set(contextState.selectStateMap, i, payload[i])
    );
  },
  [type.FILTER_VIDEOS](contextState, value) {
    contextState.visibleVideos = value;
  },
};

export default mutations;
