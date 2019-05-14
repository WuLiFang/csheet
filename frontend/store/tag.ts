import { getDataFromAppElement } from '@/datatools';
import { TagResponse } from '@/interface';
import axios, { AxiosResponse } from 'axios';
import * as _ from 'lodash';
import Vue from 'vue';
import { DefaultComputed } from 'vue/types/options';
import {
  ActionContext,
  ActionTree,
  GetterTree,
  mapGetters,
  mapState,
  Module,
  MutationTree,
} from 'vuex';
import {
  TAG,
  TagCreateActionPayload,
  TagDeleteActionPayload,
  TagDeleteMutationPayload,
  TagReadActionPayload,
  TagUpdateActionPayload,
  TagUpdateMutationPayload,
  VideosAddTagActionPayload,
  VideosAddTagMutationsPayload,
  VIDEOS_ADD_TAG,
} from '../mutation-types';
import { skipIfIsFileProtocol } from '../packtools';
import {
  mapGettersMixin,
  RootState,
  TagGetters,
  TagState,
  TagStoreByText,
} from './types';

export const getters: GetterTree<TagState, RootState> = {
  tags(contextState): TagResponse[] {
    return _.sortBy(
      _.values(contextState.storage) as TagResponse[],
      i => i.text
    );
  },
  tagStoreByText(contextState): TagStoreByText {
    return _.groupBy(contextState.storage, i => i!.text) as TagStoreByText;
  },
  getTagByTextArray(contextState, contextGetters) {
    return (textArray: string[]): TagResponse[] => {
      return _.flatMap(textArray, i => contextGetters.tagStoreByText[i]);
    };
  },
};

interface TagComputedMixin
  extends DefaultComputed,
    mapGettersMixin<TagGetters> {
  tagStore: () => TagState;
}

export const tagComputedMinxin = {
  ...mapState(['tagStore']),
  ...mapGetters(Object.keys(getters)),
} as TagComputedMixin;

function parseDataFromPage(): TagState['storage'] {
  const data = getDataFromAppElement('tag');
  if (!data) {
    return {};
  }
  const parsed = JSON.parse(data) as TagResponse[];
  const ret: TagState['storage'] = {};
  parsed.forEach(value => {
    ret[value.id] = value;
  });
  return ret;
}

const state: TagState = {
  storage: parseDataFromPage(),
};

const mutations: MutationTree<TagState> = {
  [TAG.UPDATE](contextState, payload: TagUpdateMutationPayload) {
    Vue.set(contextState.storage, String(payload.id), payload.data);
  },
  [TAG.DELETE](contextState, payload: TagDeleteMutationPayload) {
    Vue.delete(contextState.storage, String(payload.id));
  },
};

function HandleTagResponse(
  response: AxiosResponse,
  context: ActionContext<TagState, RootState>
) {
  const data: TagResponse = response.data;
  const mutationPayload: TagUpdateMutationPayload = {
    id: data.id,
    data,
  };
  context.commit(TAG.UPDATE, mutationPayload);
}

const actions: ActionTree<TagState, RootState> = {
  [TAG.CREATE]: async (context, payload: TagCreateActionPayload) => {
    return skipIfIsFileProtocol(() => {
      return axios.post('/api/tag', payload.data).then(response => {
        HandleTagResponse(response, context);
        return response;
      });
    })();
  },
  async [TAG.READ](context, payload: TagReadActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios.get(`/api/tag/${payload.id}`).then(response => {
        HandleTagResponse(response, context);
        return response;
      });
    })();
  },
  async [TAG.UPDATE](context, payload: TagUpdateActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios
        .put(`/api/tag/${payload.id}`, payload.data)
        .then(response => {
          HandleTagResponse(response, context);
          return response;
        });
    })();
  },
  async [TAG.DELETE](context, payload: TagDeleteActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios.delete(`/api/tag/${payload.id}`);
    })();
  },
  async [VIDEOS_ADD_TAG](context, payload: VideosAddTagActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios
        .post(`/api/tag/${payload.id}`, payload.data)
        .then(response => {
          HandleTagResponse(response, context);
          return response;
        })
        .then(() => {
          const mutationPayload: VideosAddTagMutationsPayload = {
            id: payload.id,
            videos: payload.data.videos,
          };
          context.commit(VIDEOS_ADD_TAG, mutationPayload);
        });
    })();
  },
};

const module: Module<TagState, RootState> = {
  state,
  getters,
  mutations,
  actions,
};

export default module;
