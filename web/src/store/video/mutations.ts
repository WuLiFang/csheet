import * as type from '@/mutation-types';
import { IVideoState } from '@/store/types';
import Vue from 'vue';
import { MutationTree } from 'vuex';

export const mutations: MutationTree<IVideoState> = {
  [type.VIDEO.UPDATE](contextState, payload: type.IVideoUpdateMutationPayload) {
    Vue.set(contextState.storage, payload.id, payload.data);
  },
  [type.UPDATE_BLOB_HUB](
    contextState,
    payload: type.IUpdateBlobHubMutationPayload
  ) {
    Vue.set(
      contextState.blobURLMap,
      payload.url,
      URL.createObjectURL(payload.blob)
    );
  },
  [type.CLEAR_VIDEO_BLOB](
    contextState,
    payload: type.IVideoClearBlobMutationPayload
  ) {
    for (const [key, value] of Object.entries(contextState.blobURLMap)) {
      if (payload.excludes.includes(key) || !value) {
        continue;
      }
      URL.revokeObjectURL(value);
      Vue.delete(contextState.blobURLMap, key);
    }
  },
  [type.UPDATE_VIDEO_BLOB_WHITELIST](
    contextState,
    payload: type.IVideoUpdateBlobWhiteListMapMutationPayload
  ) {
    contextState.blobWhiteListMap.set(payload.key, payload.value);
  },
  [type.VIDEOS_ADD_TAG](
    contextState,
    payload: type.IVideosAddTagMutationsPayload
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
