import { TagResponse, VideoResponse } from '@/interface';
import * as type from '@/mutation-types';
import { isFileProtocol, SkipIfIsFileProtocol } from '@/packtools';
import {
  CombinedGetters,
  CombinedRootState,
  RootState,
  VideoState,
} from '@/store/types';
import { isElementAppread } from '@/store/video/core';
import axios, { AxiosResponse } from 'axios';
import { isUndefined } from 'util';
import { ActionContext, ActionTree } from 'vuex';

async function HandleVideoReponse(
  response: AxiosResponse,
  context: ActionContext<VideoState, RootState>,
) {
  const data: VideoResponse = response.data;
  const mutationPayload: type.VideoUpdateMutationPayload = {
    id: data.uuid,
    data,
  };
  const actionPayload: type.VideoTagsReadIfFoundUndefinedActionPayload = {
    video: data,
  };
  return context
    .dispatch(type.READ_VIDEO_TAGS_IF_FOUND_UNDEFINED, actionPayload)
    .then(() => {
      context.commit(type.VIDEO.UPDATE, mutationPayload);
      return response;
    });
}

function HandleTagsReponse(
  response: AxiosResponse,
  context: ActionContext<VideoState, RootState>,
) {
  const dataArray: TagResponse[] = response.data;
  dataArray.map(data => {
    const mutationPayload: type.TagUpdateMutationPayload = {
      id: data.id,
      data,
    };
    context.commit(type.TAG.UPDATE, mutationPayload);
  });
}

export const actions: ActionTree<VideoState, RootState> = {
  async [type.VIDEO.READ](context, payload: type.VideoReadActionPayload) {
    if (isFileProtocol) {
      return;
    }
    return axios
      .get(`/api/video/${payload.id}`)
      .then(response => HandleVideoReponse(response, context));
  },
  [type.PRELOAD_VIDEO](context, payload: type.VideoPreloadActionPayload) {
    const url = context.getters.getVideoURI(payload.id, payload.role);

    if (!url || context.state.blobURLMap[url]) {
      return;
    }
    const actionPayload: type.PreloadURLActionPayload = { url };
    context.dispatch(type.PRELOAD_URL, actionPayload);
  },
  async [type.PRELOAD_URL](context, payload: type.PreloadURLActionPayload) {
    return axios.get(payload.url, { responseType: 'blob' }).then(response => {
      const mutationPayload: type.UpdateBlobHubMutationPayload = {
        url: payload.url,
        blob: response.data as Blob,
      };
      context.commit(type.UPDATE_BLOB_HUB, mutationPayload);
      return response;
    });
  },
  [type.UPDATE_VIDEO_APPEARED](context) {
    const ret = context.state.visibleVideos.filter(i => {
      const element = (context.getters as CombinedGetters).videoElementHub.get(
        i,
      );
      return element && isElementAppread(element);
    });
    const mutationPayload: type.VideoUpdateBlobWhiteListMapMutationPayload = {
      key: 'appeared',
      value: ret,
    };
    context.commit(type.UPDATE_VIDEO_BLOB_WHITELIST, mutationPayload);
    context.commit(type.CLEAR_VIDEO_BLOB);
    return ret;
  },
  async [type.VIDEO_TAGS.CREATE](
    context,
    payload: type.VideoTagsCreateActionPayload,
  ) {
    return SkipIfIsFileProtocol(() => {
      return axios
        .post(`/api/video_tag/${payload.id}`, payload.data)
        .then(response => HandleVideoReponse(response, context));
    })();
  },
  async [type.VIDEO_TAGS.UPDATE](
    context,
    payload: type.VideoTagsUpdateActionPayload,
  ) {
    return SkipIfIsFileProtocol(() => {
      return axios
        .put(`/api/video_tag/${payload.id}`, {
          action: 'update',
          ...payload.data,
        })
        .then(response => HandleVideoReponse(response, context));
    })();
  },
  async [type.VIDEO_TAGS.DELETE](
    context,
    payload: type.VideoTagsDeleteActionPayload,
  ) {
    return SkipIfIsFileProtocol(() => {
      return axios
        .put(`/api/video_tag/${payload.id}`, {
          action: 'delete',
          ...payload.data,
        })
        .then(response => HandleVideoReponse(response, context));
    })();
  },
  async [type.VIDEO_TAGS.READ](
    context,
    payload: type.VideoTagsReadActionPayload,
  ) {
    return SkipIfIsFileProtocol(() => {
      return axios
        .get(`/api/video_tag/${payload.id}`)
        .then(response => HandleTagsReponse(response, context));
    })();
  },
  async [type.READ_VIDEO_TAGS_IF_FOUND_UNDEFINED](
    context,
    payload: type.VideoTagsReadIfFoundUndefinedActionPayload,
  ) {
    const video = payload.video;
    return new Promise((resolve, reject) => {
      if (
        video.tags.some(i =>
          isUndefined(
            (context.rootState as CombinedRootState).tagStore.storage[i],
          ),
        )
      ) {
        const tagsPayload: type.VideoTagsReadActionPayload = { id: video.uuid };
        return context
          .dispatch(type.VIDEO_TAGS.READ, tagsPayload)
          .then(resolve)
          .catch(reject);
      }
      resolve();
    });
  },
  [type.FILTER_VIDEOS](context) {
    context.commit(
      type.FILTER_VIDEOS,
      Object.keys(context.state.storage).filter(i =>
        (context.getters as CombinedGetters).filter(context.state.storage[i]),
      ),
    );
  },
};
export default actions;