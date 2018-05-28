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
    CGTeamWorkTaskUpdateFieldActionPayload,
    UPDATE_CGTEAMWORK_TASK_FIELD,
    CREATE_CGTEAMWORK_TASK_NOTE,
    CGTeamWorkTaskCreateNoteActionPayload,
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
    async [UPDATE_CGTEAMWORK_TASK_FIELD](context, payload: CGTeamWorkTaskUpdateFieldActionPayload) {
        if (isFileProtocol) {
            return;
        }
        return axios.put(`/api/task/${payload.id}/${payload.field}`, payload.data).then(
            (response) => {
                handleCGTeamWorkTaskResponse(context, response);
                if (payload.reason) {
                    const notePayload: CGTeamWorkTaskCreateNoteActionPayload = { id: payload.id, text: payload.reason };
                    context.dispatch(CREATE_CGTEAMWORK_TASK_NOTE, notePayload);
                }
                return response;
            },
        );
    },
    async [CREATE_CGTEAMWORK_TASK_NOTE](context, payload: CGTeamWorkTaskCreateNoteActionPayload) {
        return axios.post(`api/task_note/${payload.id}`, { text: payload.text });
    },
};

const module: Module<CGTeamworkTaskState, RootState> = {
    state,
    getters,
    mutations,
    actions,
};

export default module;
