import { ITagResponse, IVideoResponse, VideoRole } from '@/interface';
import * as type from '@/mutation-types';
import { skipIfIsFileProtocol } from '@/packtools';
import {
  ICombinedGetters,
  ICombinedRootState,
  IRootState,
  IVideoState,
} from '@/store/types';
import { isElementAppeared } from '@/store/video/core';
import axios, { AxiosResponse } from 'axios';
import { compact } from 'lodash';
import { ActionContext, ActionTree } from 'vuex';

async function handleVideoResponse(
  response: AxiosResponse,
  context: ActionContext<IVideoState, IRootState>
) {
  const data: IVideoResponse = response.data;
  const mutationPayload: type.IVideoUpdateMutationPayload = {
    data,
    id: data.uuid,
  };
  const actionPayload: type.IVideoTagsReadIfFoundUndefinedActionPayload = {
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
    const mutationPayload: type.ITagUpdateMutationPayload = {
      data,
      id: data.id,
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
  async [type.VIDEO.UPDATE](context, payload: type.IVideoUpdateActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios
        .put(`/api/video/${payload.id}`, payload.data)
        .then(response => handleVideoResponse(response, context));
    })();
  },
  async [type.PRELOAD_VIDEO](
    context,
    payload: type.IVideoPreloadActionPayload
  ) {
    return skipIfIsFileProtocol(() => {
      const url = context.getters.getVideoURI(payload.id, payload.role);
      const config = { ...payload }; // Create new obejct to save config to avoid mutation in other place.
      if (!url || context.state.blobURLMap[url]) {
        return;
      }
      const actionPayload: type.IPreloadURLActionPayload = {
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
  async [type.PRELOAD_URL](context, payload: type.IPreloadURLActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios
        .get(payload.url, {
          onDownloadProgress: payload.onprogress,
          responseType: 'blob',
        })
        .then(response => {
          const mutationPayload: type.IUpdateBlobHubMutationPayload = {
            blob: response.data as Blob,
            url: payload.url,
          };
          context.commit(type.UPDATE_BLOB_HUB, mutationPayload);
          return response;
        });
    })();
  },
  [type.CLEAR_VIDEO_BLOB](context) {
    const payload: type.IVideoClearBlobMutationPayload = { excludes: [] };
    const whiteList: string[] = [];
    for (const value of context.state.blobWhiteListMap.values()) {
      if (value) {
        whiteList.push(...value);
      }
    }
    for (const id of whiteList) {
      payload.excludes.push(
        ...compact([
          context.getters.getVideoURI(id, VideoRole.poster),
          context.getters.getVideoURI(id, VideoRole.preview),
        ])
      );
    }
    context.commit(type.CLEAR_VIDEO_BLOB, payload);
  },
  [type.UPDATE_VIDEO_APPEARED](context) {
    const ret = context.state.visibleVideos.filter(i => {
      const element = (context.getters as ICombinedGetters).videoElementHub.get(
        i
      );
      return element && isElementAppeared(element);
    });
    const mutationPayload: type.IVideoUpdateBlobWhiteListMapMutationPayload = {
      key: 'appeared',
      value: ret,
    };
    context.commit(type.UPDATE_VIDEO_BLOB_WHITELIST, mutationPayload);
    context.dispatch(type.CLEAR_VIDEO_BLOB);
    return ret;
  },
  async [type.VIDEO_TAGS.CREATE](
    context,
    payload: type.IVideoTagsCreateActionPayload
  ) {
    return skipIfIsFileProtocol(() => {
      return axios
        .post(`/api/video_tag/${payload.id}`, payload.data)
        .then(response => handleVideoResponse(response, context));
    })();
  },
  async [type.VIDEO_TAGS.UPDATE](
    context,
    payload: type.IVideoTagsUpdateActionPayload
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
    payload: type.IVideoTagsDeleteActionPayload
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
    payload: type.IVideoTagsReadIfFoundUndefinedActionPayload
  ) {
    return skipIfIsFileProtocol(() => {
      const video = payload.video;
      return new Promise((resolve, reject) => {
        if (
          video.tags.some(
            i =>
              (context.rootState as ICombinedRootState).tagStore.storage[i] ===
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
