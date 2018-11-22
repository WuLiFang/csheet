import { parseTaskStatus } from '@/datatools';
import { isFileProtocol } from '@/packtools';
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
import { CGTeamWorkTaskResponse, TaskStage, TaskStatus } from '../interface';
import {
  CGTeamWorkTaskCreateNoteActionPayload,
  CGTeamWorkTaskReadActionPayload,
  CGTeamWorkTaskReadMutationPayload,
  CGTeamWorkTaskUpdateFieldActionPayload,
  CGTEAMWORK_TASK,
  CREATE_CGTEAMWORK_TASK_NOTE,
  UPDATE_CGTEAMWORK_TASK_FIELD,
} from '../mutation-types';
import {
  CGTeamWorkTaskGetters,
  CGTeamworkTaskState,
  mapGettersMixin,
  RootState,
} from './types';

export const getters: GetterTree<CGTeamworkTaskState, RootState> = {
  getGeneralStatus(contextState) {
    return (id: string, stage = TaskStage.client): TaskStatus => {
      const task = contextState.storage[id];
      if (!task) {
        return TaskStatus.Unset;
      }
      let data: TaskStatus[] = [];
      type stageMapItem = [TaskStage, TaskStatus];
      const types = '';
      const stageMap: stageMapItem[] = [
        [TaskStage.leader, parseTaskStatus(task.leader_status)],
        [TaskStage.director, parseTaskStatus(task.director_status)],
        [TaskStage.client, parseTaskStatus(task.client_status)],
      ];
      stageMap.forEach(i => {
        if (stage >= i[0]) {
          data.push(i[1]);
        }
      });
      return Math.min(...data);
    };
  },
  artists(contextState): string[] {
    return _.uniq(_.flatMap(contextState.storage, i => i!.artists)).sort();
  },
  getAritstTaskCount(contextState) {
    return (artist: string) =>
      _.filter(contextState.storage, i => i!.artists.indexOf(artist) >= 0)
        .length;
  },
};

interface CGTeamWorkTaskComputedMixin
  extends DefaultComputed,
    mapGettersMixin<CGTeamWorkTaskGetters> {
  cgTeamworkTaskStore: () => CGTeamworkTaskState;
}

export const CGTeamWorkTaskComputedMixin = {
  ...mapState(['cgTeamworkTaskStore']),
  ...mapGetters(Object.keys(getters)),
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
  parsed.forEach(i => {
    ret[i.uuid] = i;
  });
  return ret;
}

const state: CGTeamworkTaskState = { storage: parseDataFromPage() };

const mutations: MutationTree<CGTeamworkTaskState> = {
  [CGTEAMWORK_TASK.READ](
    contextState,
    payload: CGTeamWorkTaskReadMutationPayload
  ) {
    Vue.set(contextState.storage, payload.id, payload.data);
  },
  [CGTEAMWORK_TASK.UPDATE](
    contextState,
    payload: CGTeamWorkTaskReadMutationPayload
  ) {
    Vue.set(contextState.storage, payload.id, payload.data);
  },
};

function handleCGTeamWorkTaskResponse(
  context: ActionContext<CGTeamworkTaskState, RootState>,
  response: AxiosResponse<CGTeamWorkTaskResponse>
) {
  if (response.status !== 200) {
    return;
  }
  const data = response.data;
  const mutationPayload: CGTeamWorkTaskReadMutationPayload = {
    id: data.uuid,
    data,
  };
  context.commit(CGTEAMWORK_TASK.READ, mutationPayload);
}

const actions: ActionTree<CGTeamworkTaskState, RootState> = {
  async [CGTEAMWORK_TASK.READ](
    context,
    payload: CGTeamWorkTaskReadActionPayload
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
    payload: CGTeamWorkTaskUpdateFieldActionPayload
  ) {
    if (isFileProtocol) {
      return;
    }
    return axios
      .put(`/api/task/${payload.id}/${payload.field}`, payload.data)
      .then(response => {
        handleCGTeamWorkTaskResponse(context, response);
      });
  },
  async [CREATE_CGTEAMWORK_TASK_NOTE](
    context,
    payload: CGTeamWorkTaskCreateNoteActionPayload
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
