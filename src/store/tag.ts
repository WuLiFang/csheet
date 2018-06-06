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

import { RootState, LoadStatus, TagState } from './types';
import {
  TAG,
  TagReadActionPayload,
  TagUpdateMutationPayload,
  TagCreateActionPayload,
  TagUpdateActionPayload,
  TagDeleteActionPayload,
  TagDeleteMutationPayload,
} from '../mutation-types';
import { isFileProtocol } from '../packtools';
import { getDataFromAppElement } from '@/datatools';
import { TagResponse } from '@/interface';

export const getters: GetterTree<TagState, RootState> = {
  tags(contextState): TagResponse[] {
    return _.sortBy(_.values(contextState.storage), i => i.text);
  },
};

interface TagComputedMixin extends DefaultComputed {
  tagStore: () => TagState;
  tags: () => TagResponse[];
}

export const tagComputedMinxin = {
  ...mapState(['tagStore']),
  ...mapGetters(['tags']),
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
  return {};
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

function HandleTagReponse(
  response: AxiosResponse,
  context: ActionContext<TagState, RootState>,
) {
  const data: TagResponse = response.data;
  const mutationPayload: TagUpdateMutationPayload = {
    id: data.id,
    data,
  };
  context.commit(TAG.UPDATE, mutationPayload);
}

const actions: ActionTree<TagState, RootState> = {
  async [TAG.CREATE](context, payload: TagCreateActionPayload) {
    return axios.post('/api/tag', payload.data).then(response => {
      HandleTagReponse(response, context);
      return response;
    });
  },
  async [TAG.READ](context, payload: TagReadActionPayload) {
    if (isFileProtocol) {
      return;
    }
    return axios.get(`/api/tag/${payload.id}`).then(response => {
      HandleTagReponse(response, context);
      return response;
    });
  },
  async [TAG.UPDATE](context, payload: TagUpdateActionPayload) {
    if (isFileProtocol) {
      return;
    }
    return axios.put(`/api/tag/${payload.id}`, payload.data).then(response => {
      HandleTagReponse(response, context);
      return response;
    });
  },
  async [TAG.DELETE](context, payload: TagDeleteActionPayload) {
    if (isFileProtocol) {
      return;
    }
    return axios.delete(`/api/tag/${payload.id}`);
  },
};

const module: Module<TagState, RootState> = {
  state,
  getters,
  mutations,
  actions,
};

export default module;
