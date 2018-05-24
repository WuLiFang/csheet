import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

import axios from 'axios';

import * as mutations from '../mutation-types';

import videoStore from './video';
import cgTeamworkTaskStore from './cgteamwork-task';
import { RootState } from './types';


const store: StoreOptions<RootState> = {
        strict: process.env.NODE_ENV !== 'production',
        modules: {
            videoStore,
            cgTeamworkTaskStore,
        },
    };

export default store;
