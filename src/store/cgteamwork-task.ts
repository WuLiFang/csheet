import Vue from 'vue';
import { Module, MutationTree, ActionTree, GetterTree, mapGetters, mapState, ActionContext } from 'vuex';
import { DefaultComputed } from 'vue/types/options';

import * as _ from 'lodash';
import axios from 'axios';
import { AxiosResponse } from 'axios';

import { RootState, VideoState, IDMap, LoadStatus, CGTeamworkTaskState } from './types';
import { CGTeamWorkTaskResponse, CGTeamWorkTaskData, parseCGTeamWorkTaskResponse } from '../interface';
import {
    CGTEAMWORK_TASK,
    CGTeamWorkTaskReadActionPayload,
    CGTeamWorkTaskReadMutationPayload,
    CGTeamWorkTaskUpdateActionPayload,
} from '../mutation-types';
import { isFileProtocol } from '@/packtools';

export const getters: GetterTree<CGTeamworkTaskState, RootState> = {
};

interface CGTeamWorkTaskComputedMixin extends DefaultComputed {
    cgTeamworkTaskStore: () => CGTeamworkTaskState;
}

export const cgTeamWorkComputedMinxin = {
    ...mapState(
        ['cgTeamworkTaskStore'],
    ),
    ...mapGetters([
    ]),
} as CGTeamWorkTaskComputedMixin;

const state: CGTeamworkTaskState = { storage: {} };

const mutations: MutationTree<CGTeamworkTaskState> = {
    [CGTEAMWORK_TASK.READ](contextState, payload: CGTeamWorkTaskReadMutationPayload) {
        Vue.set(contextState.storage, payload.id, payload.data);
    },
};

function handleCGTeamWorkTaskResponse(
    context: ActionContext<CGTeamworkTaskState, RootState>, response: AxiosResponse) {
    if (response.status !== 200) {
        return;
    }
    const data: CGTeamWorkTaskData = parseCGTeamWorkTaskResponse(response.data);
    const mutationPayload: CGTeamWorkTaskReadMutationPayload = { id: data.id, data };
    context.commit(CGTEAMWORK_TASK.READ, mutationPayload);
}

const actions: ActionTree<CGTeamworkTaskState, RootState> = {
    async [CGTEAMWORK_TASK.READ](context, payload: CGTeamWorkTaskReadActionPayload) {
        if (isFileProtocol) {
            return;
        }
        return axios.get(`/api/task/${payload.id}`).then(
            (response) => {
                handleCGTeamWorkTaskResponse(context, response);
                return response;
            });
    },
    async [CGTEAMWORK_TASK.UPDATE](context, payload: CGTeamWorkTaskUpdateActionPayload) {
        if (isFileProtocol) {
            return;
        }
        return axios.put(`/api/taks/${payload.id}`, payload.data).then(
            (response) => {
                handleCGTeamWorkTaskResponse(context, response);
                return response;
            },
        );
    },
};

const module: Module<CGTeamworkTaskState, RootState> = {
    state,
    getters,
    mutations,
    actions,
};

export default module;
