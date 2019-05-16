import { getDataFromAppElement } from '@/datatools';
import { ITagResponse } from '@/interface';
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
} from '@/mutation-types';
import { skipIfIsFileProtocol } from '@/packtools';
import {
  IRootState,
  ITagGetters,
  ITagState,
  ITagStoreByText,
  mapGettersMixin,
} from '@/store/types';
import axios, { AxiosResponse } from 'axios';
import { flatMap, groupBy, sortBy, values } from 'lodash';
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

export const getters: GetterTree<ITagState, IRootState> = {
  tagStoreByText(contextState): ITagStoreByText {
    return groupBy(contextState.storage, i => i!.text) as ITagStoreByText;
  },
  tags(contextState): ITagResponse[] {
    return sortBy(values(contextState.storage) as ITagResponse[], i => i.text);
  },
  getTagByTextArray(contextState, contextGetters) {
    return (textArray: string[]): ITagResponse[] => {
      return flatMap(textArray, i => contextGetters.tagStoreByText[i]);
    };
  },
};

interface ITagComputedMixin
  extends DefaultComputed,
    mapGettersMixin<ITagGetters> {
  tagStore: () => ITagState;
}

export const tagComputedMixin = {
  ...mapState(['tagStore']),
  ...mapGetters(Object.keys(getters)),
} as ITagComputedMixin;

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
    data,
    id: data.id,
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
  actions,
  getters,
  mutations,
  state,
};

export default module;
