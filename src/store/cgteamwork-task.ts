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

import {
  RootState,
  VideoState,
  IDMap,
  LoadStatus,
  CGTeamworkTaskState,
} from './types';
import {
  CGTeamWorkTaskResponse,
  CGTeamWorkTaskData,
  parseCGTeamWorkTaskResponse,
  TaskStatus,
  TaskStage,
} from '../interface';
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
  getGeneralStatus(contextState) {
    return (id: string, stage = TaskStage.client): TaskStatus | null => {
      const task = contextState.storage[id];
      if (!task) {
        return null;
      }
      let data: TaskStatus[] = [];
      type stageMapItem = [TaskStage, TaskStatus];
      const stageMap: stageMapItem[] = [
        [TaskStage.leader, task.leader_status],
        [TaskStage.director, task.director_status],
        [TaskStage.client, task.client_status],
      ];
      stageMap.forEach(i => {
        if (stage >= i[0]) {
          data.push(i[1]);
        }
      });
      data = data.filter(i => typeof i !== 'undefined');
      return Math.min(...data);
    };
  },
};

interface CGTeamWorkTaskComputedMixin extends DefaultComputed {
  cgTeamworkTaskStore: () => CGTeamworkTaskState;
  getGeneralStatus: () => (id: string, stage?: TaskStage) => TaskStatus | null;
}

export const CGTeamWorkTaskComputedMixin = {
  ...mapState(['cgTeamworkTaskStore']),
  ...mapGetters(['getGeneralStatus']),
} as CGTeamWorkTaskComputedMixin;

function parseDataFromPage(): CGTeamworkTaskState['storage'] {
  const app = document.getElementById('app');
  if (!app) {
    return {};
  }
  const data = app.dataset.task;
  if (!data) {
    return {};
  }
  const time = new Date().getTime();
  const parsed = JSON.parse(data) as CGTeamWorkTaskResponse[];
  const ret: CGTeamworkTaskState['storage'] = {};
  parsed.forEach(value => {
    if (typeof value[7] === 'undefined') {
      value[7] = {};
    }
    const task = parseCGTeamWorkTaskResponse(value);
    ret[task.id] = task;
  });
  return ret;
}

const state: CGTeamworkTaskState = { storage: parseDataFromPage() };

const mutations: MutationTree<CGTeamworkTaskState> = {
  [CGTEAMWORK_TASK.READ](
    contextState,
    payload: CGTeamWorkTaskReadMutationPayload,
  ) {
    Vue.set(contextState.storage, payload.id, payload.data);
  },
};

function handleCGTeamWorkTaskResponse(
  context: ActionContext<CGTeamworkTaskState, RootState>,
  response: AxiosResponse,
) {
  if (response.status !== 200) {
    return;
  }
  const data: CGTeamWorkTaskData = parseCGTeamWorkTaskResponse(response.data);
  const mutationPayload: CGTeamWorkTaskReadMutationPayload = {
    id: data.id,
    data,
  };
  context.commit(CGTEAMWORK_TASK.READ, mutationPayload);
}

const actions: ActionTree<CGTeamworkTaskState, RootState> = {
  async [CGTEAMWORK_TASK.READ](
    context,
    payload: CGTeamWorkTaskReadActionPayload,
  ) {
    if (isFileProtocol) {
      return;
    }
    return axios.get(`/api/task/${payload.id}`).then(response => {
      handleCGTeamWorkTaskResponse(context, response);
      return response;
    });
  },
  async [UPDATE_CGTEAMWORK_TASK_FIELD](
    context,
    payload: CGTeamWorkTaskUpdateFieldActionPayload,
  ) {
    if (isFileProtocol) {
      return;
    }
    return axios
      .put(`/api/task/${payload.id}/${payload.field}`, payload.data)
      .then(response => {
        handleCGTeamWorkTaskResponse(context, response);
        if (payload.reason) {
          const notePayload: CGTeamWorkTaskCreateNoteActionPayload = {
            id: payload.id,
            text: payload.reason,
          };
          context.dispatch(CREATE_CGTEAMWORK_TASK_NOTE, notePayload);
        }
        return response;
      });
  },
  async [CREATE_CGTEAMWORK_TASK_NOTE](
    context,
    payload: CGTeamWorkTaskCreateNoteActionPayload,
  ) {
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
