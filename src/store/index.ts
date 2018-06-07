import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

import axios from 'axios';

import * as mutations from '../mutation-types';

import videoStore from './video';
import cgTeamworkTaskStore from './cgteamwork-task';
import tagStore from './tag';
import { RootState } from './types';
import { getDataFromAppElement } from '@/datatools';

const store: StoreOptions<RootState> = {
  strict: process.env.NODE_ENV !== 'production',
  state: {
    username: getDataFromAppElement('username', ''),
    isEnablePreview: true,
  },
  modules: {
    videoStore,
    cgTeamworkTaskStore,
    tagStore,
  },
  mutations: {
    [mutations.UPDATE_IS_ENABLE_PREVIEW](state, value: boolean) {
      state.isEnablePreview = value;
    },
  },
};

export default store;
