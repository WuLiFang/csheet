import { ITagResponse, IVideoResponse } from '@/interface';
import * as type from '@/mutation-types';
import { skipIfIsFileProtocol } from '@/packtools';
import {
  ICombinedGetters,
  ICombinedIRootState,
  IRootState,
  IVideoState,
} from '@/store/types';
import { isElementAppeared } from '@/store/video/core';
import axios, { AxiosResponse } from 'axios';
import { ActionContext, ActionTree } from 'vuex';

async function handleVideoResponse(
  response: AxiosResponse,
  context: ActionContext<IVideoState, IRootState>
) {
  const data: IVideoResponse = response.data;
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

function handleTagsResponse(
  response: AxiosResponse,
  context: ActionContext<IVideoState, IRootState>
) {
  const dataArray: ITagResponse[] = response.data;
  dataArray.map(data => {
    const mutationPayload: type.TagUpdateMutationPayload = {
      id: data.id,
      data,
    };
    context.commit(type.TAG.UPDATE, mutationPayload);
  });
}

export const actions: ActionTree<IVideoState, IRootState> = {
  async [type.VIDEO.READ](context, payload: type.VideoReadActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios
        .get(`/api/video/${payload.id}`)
        .then(response => handleVideoResponse(response, context));
    })();
  },
  async [type.VIDEO.UPDATE](context, payload: type.VideoUpdateActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios
        .put(`/api/video/${payload.id}`, payload.data)
        .then(response => handleVideoResponse(response, context));
    })();
  },
  async [type.PRELOAD_VIDEO](context, payload: type.VideoPreloadActionPayload) {
    return skipIfIsFileProtocol(() => {
      const url = context.getters.getVideoURI(payload.id, payload.role);
      const config = { ...payload }; // Create new obejct to save config to avoid mutation in other place.
      if (!url || context.state.blobURLMap[url]) {
        return;
      }
      const actionPayload: type.PreloadURLActionPayload = {
        url,
        onprogress(event: ProgressEvent) {
          if (payload.onprogress) {
            payload.onprogress(event, config);
          }
        },
      };
      return context.dispatch(type.PRELOAD_URL, actionPayload);
    })();
  },
  async [type.PRELOAD_URL](context, payload: type.PreloadURLActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios
        .get(payload.url, {
          responseType: 'blob',
          onDownloadProgress: payload.onprogress,
        })
        .then(response => {
          const mutationPayload: type.UpdateBlobHubMutationPayload = {
            url: payload.url,
            blob: response.data as Blob,
          };
          context.commit(type.UPDATE_BLOB_HUB, mutationPayload);
          return response;
        });
    })();
  },
  [type.UPDATE_VIDEO_APPEARED](context) {
    const ret = context.state.visibleVideos.filter(i => {
      const element = (context.getters as ICombinedGetters).videoElementHub.get(
        i
      );
      return element && isElementAppeared(element);
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
    payload: type.VideoTagsCreateActionPayload
  ) {
    return skipIfIsFileProtocol(() => {
      return axios
        .post(`/api/video_tag/${payload.id}`, payload.data)
        .then(response => handleVideoResponse(response, context));
    })();
  },
  async [type.VIDEO_TAGS.UPDATE](
    context,
    payload: type.VideoTagsUpdateActionPayload
  ) {
    return skipIfIsFileProtocol(() => {
      return axios
        .put(`/api/video_tag/${payload.id}`, {
          action: 'update',
          ...payload.data,
        })
        .then(response => handleVideoResponse(response, context));
    })();
  },
  async [type.VIDEO_TAGS.DELETE](
    context,
    payload: type.VideoTagsDeleteActionPayload
  ) {
    return skipIfIsFileProtocol(() => {
      return axios
        .put(`/api/video_tag/${payload.id}`, {
          action: 'delete',
          ...payload.data,
        })
        .then(response => handleVideoResponse(response, context));
    })();
  },
  async [type.VIDEO_TAGS.READ](
    context,
    payload: type.VideoTagsReadActionPayload
  ) {
    return skipIfIsFileProtocol(() => {
      return axios
        .get(`/api/video_tag/${payload.id}`)
        .then(response => handleTagsResponse(response, context));
    })();
  },
  async [type.READ_VIDEO_TAGS_IF_FOUND_UNDEFINED](
    context,
    payload: type.VideoTagsReadIfFoundUndefinedActionPayload
  ) {
    return skipIfIsFileProtocol(() => {
      const video = payload.video;
      return new Promise((resolve, reject) => {
        if (
          video.tags.some(
            i =>
              (context.rootState as ICombinedIRootState).tagStore.storage[i] ===
              undefined
          )
        ) {
          const tagsPayload: type.VideoTagsReadActionPayload = {
            id: video.uuid,
          };
          return context
            .dispatch(type.VIDEO_TAGS.READ, tagsPayload)
            .then(resolve)
            .catch(reject);
        }
        resolve();
      });
    })();
  },
  [type.FILTER_VIDEOS](context) {
    context.commit(
      type.FILTER_VIDEOS,
      Object.keys(context.state.storage).filter(i => {
        const video = context.state.storage[i];
        return video && (context.getters as ICombinedGetters).filter(video);
      })
    );
  },
};
export default actions;
