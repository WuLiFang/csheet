import { getDataFromAppElement } from '@/datatools';
import { ITagResponse } from '@/interface';
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
  ITagCreateActionPayload,
  ITagUpdateActionPayload,
  ITagUpdateMutationPayload,
  IVideosAddTagActionPayload,
  IVideosAddTagMutationsPayload,
  TAG,
  TagDeleteActionPayload,
  TagDeleteMutationPayload,
  TagReadActionPayload,
  VIDEOS_ADD_TAG,
} from '../mutation-types';
import { skipIfIsFileProtocol } from '../packtools';
import {
  IRootState,
  ITagGetters,
  ITagState,
  ITagStoreByText,
  mapGettersMixin,
} from './types';

export const getters: GetterTree<ITagState, IRootState> = {
  tags(contextState): ITagResponse[] {
    return _.sortBy(
      _.values(contextState.storage) as ITagResponse[],
      i => i.text
    );
  },
  ITagStoreByText(contextState): ITagStoreByText {
    return _.groupBy(contextState.storage, i => i!.text) as ITagStoreByText;
  },
  getTagByTextArray(contextState, contextGetters) {
    return (textArray: string[]): ITagResponse[] => {
      return _.flatMap(textArray, i => contextGetters.ITagStoreByText[i]);
    };
  },
};

interface TagComputedMixin
  extends DefaultComputed,
    mapGettersMixin<ITagGetters> {
  tagStore: () => ITagState;
}

export const tagComputedMixin = {
  ...mapState(['tagStore']),
  ...mapGetters(Object.keys(getters)),
} as TagComputedMixin;

function parseDataFromPage(): ITagState['storage'] {
  const data = getDataFromAppElement('tag');
  if (!data) {
    return {};
  }
  const parsed = JSON.parse(data) as ITagResponse[];
  const ret: ITagState['storage'] = {};
  parsed.forEach(value => {
    ret[value.id] = value;
  });
  return ret;
}

const state: ITagState = {
  storage: parseDataFromPage(),
};

const mutations: MutationTree<ITagState> = {
  [TAG.UPDATE](contextState, payload: ITagUpdateMutationPayload) {
    Vue.set(contextState.storage, String(payload.id), payload.data);
  },
  [TAG.DELETE](contextState, payload: TagDeleteMutationPayload) {
    Vue.delete(contextState.storage, String(payload.id));
  },
};

function handleTagResponse(
  response: AxiosResponse,
  context: ActionContext<ITagState, IRootState>
) {
  const data: ITagResponse = response.data;
  const mutationPayload: ITagUpdateMutationPayload = {
    id: data.id,
    data,
  };
  context.commit(TAG.UPDATE, mutationPayload);
}

const actions: ActionTree<ITagState, IRootState> = {
  [TAG.CREATE]: async (context, payload: ITagCreateActionPayload) => {
    return skipIfIsFileProtocol(() => {
      return axios.post('/api/tag', payload.data).then(response => {
        handleTagResponse(response, context);
        return response;
      });
    })();
  },
  async [TAG.READ](context, payload: TagReadActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios.get(`/api/tag/${payload.id}`).then(response => {
        handleTagResponse(response, context);
        return response;
      });
    })();
  },
  async [TAG.UPDATE](context, payload: ITagUpdateActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios
        .put(`/api/tag/${payload.id}`, payload.data)
        .then(response => {
          handleTagResponse(response, context);
          return response;
        });
    })();
  },
  async [TAG.DELETE](context, payload: TagDeleteActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios.delete(`/api/tag/${payload.id}`);
    })();
  },
  async [VIDEOS_ADD_TAG](context, payload: IVideosAddTagActionPayload) {
    return skipIfIsFileProtocol(() => {
      return axios
        .post(`/api/tag/${payload.id}`, payload.data)
        .then(response => {
          handleTagResponse(response, context);
          return response;
        })
        .then(() => {
          const mutationPayload: IVideosAddTagMutationsPayload = {
            id: payload.id,
            videos: payload.data.videos,
          };
          context.commit(VIDEOS_ADD_TAG, mutationPayload);
        });
    })();
  },
};

const module: Module<ITagState, IRootState> = {
  state,
  getters,
  mutations,
  actions,
};

export default module;
