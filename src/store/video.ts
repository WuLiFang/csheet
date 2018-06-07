import Vue from 'vue';
import {
  Module,
  MutationTree,
  ActionTree,
  GetterTree,
  mapGetters,
  mapState,
  ActionContext,
} from 'vuex';
import { DefaultComputed } from 'vue/types/options';

import * as _ from 'lodash';
import axios from 'axios';
import { AxiosResponse } from 'axios';

import { RootState, VideoState, IDMap, LoadStatus } from './types';
import {
  VIDEO,
  VideoUpdateMutationPayload,
  VideoReadActionPayload,
  SET_VIDEO_VISIBILITY,
  VideoSetVisibilityMutationPayload,
  UPDATE_VIDEO_APPEARING,
  VideoUpdateAppearingMutationPayload,
  UPDATE_VIDEO_POSITION,
  VideoUpdatePositionMutationPayload,
  UPDATE_BLOB_HUB,
  UpdateBlobHubMutationPayload,
  PRELOAD_VIDEO,
  VideoPreloadActionPayload,
  PreloadURLActionPayload,
  PRELOAD_URL,
  CLEAR_VIDEO_BLOB,
  VideoClearBlobMutationPayload,
  UPDATE_VIDEO_BLOB_WHITELIST,
  VideoUpdateBlobWhiteListMapMutationPayload,
  UPDATE_VIDEO_APPEARED,
  VIDEOS_ADD_TAG,
  VideosAddTagMutationsPayload,
  VIDEO_UPDATE_TAG,
  VideoDeleteTagActionPayload,
  VIDEO_DELETE_TAG,
  VideoUpdateTagActionPayload,
} from '../mutation-types';
import { VideoResponse, VideoRole } from '../interface';
import { isFileProtocol, SkipIfIsFileProtocol } from '../packtools';

const blobHub = new Map<string, Blob>();

async function loadBlob(url: string) {
  return axios.get(url, { responseType: 'blob' }).then(response => {
    blobHub.set(url, response.data);
    return response;
  });
}

function getPackedPath(
  videoData: VideoResponse,
  role: VideoRole,
): string | null {
  if (!getMtime(videoData, role)) {
    return null;
  }
  let ret: string | null = null;
  switch (role) {
    case VideoRole.thumb: {
      ret = _getPackedPath(videoData, 'thumbs', '.jpg');
      break;
    }
    case VideoRole.poster: {
      ret = _getPackedPath(videoData, 'images', '.jpg');
      break;
    }
    case VideoRole.preview: {
      ret = _getPackedPath(videoData, 'previews', '.mp4');
      break;
    }
  }
  return ret;
}

function _getPackedPath(
  videoData: VideoResponse,
  folder: string,
  suffix: string,
) {
  return `${folder}/${videoData.label}${suffix}`;
}
function getMtime(videoData: VideoResponse, role: VideoRole): number | null {
  switch (role) {
    case VideoRole.thumb: {
      return videoData.thumb_mtime;
    }
    case VideoRole.poster: {
      return videoData.poster_mtime;
    }
    case VideoRole.preview: {
      return videoData.preview_mtime;
    }
    default:
      return null;
  }
}
function getPath(
  videoData: VideoResponse,
  role: VideoRole,
  isForce = false,
): string | null {
  if (isFileProtocol) {
    return getPackedPath(videoData, role);
  }
  return getPathWithMtime(videoData, role, isForce);
}

function getPathWithMtime(
  videoData: VideoResponse,
  role: VideoRole,
  isForce = false,
): string | null {
  const mtime = getMtime(videoData, role);
  if (!mtime) {
    return null;
  }
  let ret = `/videos/${videoData.uuid}.${role}?timestamp=${mtime}`;
  if (isForce) {
    ret += `?forceUpdateAt=${new Date().getTime()}`;
  }
  return ret;
}
const elementHub = new Map<string, HTMLElement>();
export const getters: GetterTree<VideoState, RootState> = {
  getVideoURI(contextState) {
    return (id: string, role: VideoRole, isForce = false) => {
      const data = contextState.storage[id];
      if (!data) {
        return null;
      }
      return getPath(data, role, isForce);
    };
  },
  scrollTo() {
    return (id: string) => {
      const element = elementHub.get(id);
      if (element) {
        window.scroll(undefined, element.offsetTop);
      }
    };
  },
  getBlobURL(contextState, contextGetter) {
    return (id: string, role: VideoRole, isForce = false) => {
      const url = contextGetter.getVideoURI(id, role, isForce);
      if (!url) {
        return null;
      }
      return contextState.blobURLMap[url] || null;
    };
  },
  videoElementHub() {
    return elementHub;
  },
};

interface VideoComputedMixin extends DefaultComputed {
  videoStore: () => VideoState;
  scrollTo: () => (id: string) => void;
  getVideoURI: () => (
    id: string,
    role: VideoRole,
    isForce?: boolean,
  ) => string | null;
  getBlobURL: () => (
    id: string,
    role: VideoRole,
    isForce?: boolean,
  ) => string | null;
  videoElementHub: () => typeof elementHub;
}

export const videoComputedMinxin = {
  ...mapState(['videoStore']),
  ...mapGetters([
    'scrollTo',
    'getVideoURI',
    'getBlobURL',
    'videoElementHub',
    'appearedVideos',
  ]),
} as VideoComputedMixin;

function parseDataFromPage(): VideoState['storage'] {
  const app = document.getElementById('app');
  if (!app) {
    return {};
  }
  const data = app.dataset.page;
  if (!data) {
    return {};
  }
  const time = new Date().getTime();
  const parsed = JSON.parse(data) as VideoResponse[];
  const ret: VideoState['storage'] = {};
  parsed.forEach(value => {
    ret[value.uuid] = value;
  });
  return ret;
}

const state: VideoState = {
  storage: parseDataFromPage(),
  blobURLMap: {},
  blobWhiteListMap: new Map<string, string[]>(),
};

const mutations: MutationTree<VideoState> = {
  [VIDEO.UPDATE](contextState, payload: VideoUpdateMutationPayload) {
    Vue.set(contextState.storage, payload.id, payload.data);
  },
  [UPDATE_BLOB_HUB](contextState, payload: UpdateBlobHubMutationPayload) {
    Vue.set(
      contextState.blobURLMap,
      payload.url,
      URL.createObjectURL(payload.blob),
    );
  },
  [CLEAR_VIDEO_BLOB](contextState) {
    const whiteList: string[] = [];
    for (const value of contextState.blobWhiteListMap.values()) {
      whiteList.push(...value);
    }
    const exp = new RegExp('/videos/([^.]+)..*');
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
        URL.revokeObjectURL(url);
        Vue.delete(contextState.blobURLMap, i);
      });
  },
  [UPDATE_VIDEO_BLOB_WHITELIST](
    contextState,
    payload: VideoUpdateBlobWhiteListMapMutationPayload,
  ) {
    contextState.blobWhiteListMap.set(payload.key, payload.value);
  },
  [VIDEOS_ADD_TAG](contextState, payload: VideosAddTagMutationsPayload) {
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
};

function isElementAppread(element: HTMLElement, expand = 10): boolean {
  if (!element || element.hidden) {
    return false;
  }
  const top = window.scrollY - expand;
  const bottom = top + window.innerHeight + expand * 2;
  const ypos = element.offsetTop;
  const boxHeight = element.clientHeight;
  const ret = top <= ypos + boxHeight && ypos <= bottom;
  return ret;
}

function HandleVideoReponse(
  response: AxiosResponse,
  context: ActionContext<VideoState, RootState>,
) {
  const data: VideoResponse = response.data;
  const mutationPayload: VideoUpdateMutationPayload = {
    id: data.uuid,
    data,
  };
  context.commit(VIDEO.UPDATE, mutationPayload);
  return response;
}

const actions: ActionTree<VideoState, RootState> = {
  async [VIDEO.READ](context, payload: VideoReadActionPayload) {
    if (isFileProtocol) {
      return;
    }
    return axios
      .get(`/api/video/${payload.id}`)
      .then(response => HandleVideoReponse(response, context));
  },
  [PRELOAD_VIDEO](context, payload: VideoPreloadActionPayload) {
    const url = context.getters.getVideoURI(payload.id, payload.role);

    if (!url || context.state.blobURLMap[url]) {
      return;
    }
    const actionPayload: PreloadURLActionPayload = { url };
    context.dispatch(PRELOAD_URL, actionPayload);
  },
  async [PRELOAD_URL](context, payload: PreloadURLActionPayload) {
    return axios.get(payload.url, { responseType: 'blob' }).then(response => {
      const mutationPayload: UpdateBlobHubMutationPayload = {
        url: payload.url,
        blob: response.data as Blob,
      };
      context.commit(UPDATE_BLOB_HUB, mutationPayload);
      return response;
    });
  },
  [UPDATE_VIDEO_APPEARED](context) {
    const ret: string[] = [];
    elementHub.forEach((value, key) => {
      if (isElementAppread(value)) {
        ret.push(key);
      }
    });
    const mutationPayload: VideoUpdateBlobWhiteListMapMutationPayload = {
      key: 'appeared',
      value: ret,
    };
    context.commit(UPDATE_VIDEO_BLOB_WHITELIST, mutationPayload);
    context.commit(CLEAR_VIDEO_BLOB);
    return ret;
  },
  async [VIDEO_UPDATE_TAG](context, payload: VideoUpdateTagActionPayload) {
    return SkipIfIsFileProtocol(() => {
      return axios
        .put(`/api/video_tag/${payload.id}`, {
          action: 'update',
          ...payload.data,
        })
        .then(response => HandleVideoReponse(response, context));
    })();
  },
  async [VIDEO_DELETE_TAG](context, payload: VideoDeleteTagActionPayload) {
    return SkipIfIsFileProtocol(() => {
      return axios
        .put(`/api/video_tag/${payload.id}`, {
          action: 'delete',
          ...payload.data,
        })
        .then(response => HandleVideoReponse(response, context));
    })();
  },
};

const module: Module<VideoState, RootState> = {
  state,
  getters,
  mutations,
  actions,
};

export default module;
