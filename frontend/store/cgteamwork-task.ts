import { parseTaskStatus } from '@/datatools';
import { ICGTeamWorkTaskResponse, TaskStage, TaskStatus } from '@/interface';
import {
  CGTEAMWORK_TASK,
  CREATE_CGTEAMWORK_TASK_NOTE,
  ICGTeamWorkTaskCreateNoteActionPayload,
  ICGTeamWorkTaskReadActionPayload,
  ICGTeamWorkTaskReadMutationPayload,
  ICGTeamWorkTaskUpdateFieldActionPayload,
  UPDATE_CGTEAMWORK_TASK_FIELD,
} from '@/mutation-types';
import { isFileProtocol } from '@/packtools';
import {
  ICGTeamWorkTaskGetters,
  ICGTeamworkTaskState,
  IRootState,
  mapGettersMixin,
} from '@/store/types';
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

export const getters: GetterTree<ICGTeamworkTaskState, IRootState> = {
  getGeneralStatus(contextState) {
    return (id: string, stage: TaskStage = TaskStage.client): TaskStatus => {
      const task = contextState.storage[id];
      if (!task) {
        return TaskStatus.Unset;
      }
      const data: TaskStatus[] = [];
      type stageMapItem = [TaskStage, TaskStatus];
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
  getArtistTaskCount(contextState) {
    return (artist: string) =>
      _.filter(contextState.storage, i => i!.artists.indexOf(artist) >= 0)
        .length;
  },
};

interface CGTeamWorkTaskComputedMixin
  extends DefaultComputed,
    mapGettersMixin<ICGTeamWorkTaskGetters> {
  cgTeamworkTaskStore: () => ICGTeamworkTaskState;
}

export const CGTeamWorkTaskComputedMixin = {
  ...mapState(['cgTeamworkTaskStore']),
  ...mapGetters(Object.keys(getters)),
} as CGTeamWorkTaskComputedMixin;

function parseDataFromPage(): ICGTeamworkTaskState['storage'] {
  const app = document.getElementById('app');
  if (!app) {
    return {};
  }
  const data = app.dataset.task;
  if (!data) {
    return {};
  }
  const parsed = JSON.parse(data) as ICGTeamWorkTaskResponse[];
  const ret: ICGTeamworkTaskState['storage'] = {};
  parsed.forEach(i => {
    ret[i.uuid] = i;
  });
  return ret;
}

const state: ICGTeamworkTaskState = { storage: parseDataFromPage() };

const mutations: MutationTree<ICGTeamworkTaskState> = {
  [CGTEAMWORK_TASK.READ](
    contextState,
    payload: ICGTeamWorkTaskReadMutationPayload
  ) {
    Vue.set(contextState.storage, payload.id, payload.data);
  },
  [CGTEAMWORK_TASK.UPDATE](
    contextState,
    payload: ICGTeamWorkTaskReadMutationPayload
  ) {
    Vue.set(contextState.storage, payload.id, payload.data);
  },
};

function handleCGTeamWorkTaskResponse(
  context: ActionContext<ICGTeamworkTaskState, IRootState>,
  response: AxiosResponse<ICGTeamWorkTaskResponse>
) {
  if (response.status !== 200) {
    return;
  }
  const data = response.data;
  const mutationPayload: ICGTeamWorkTaskReadMutationPayload = {
    id: data.uuid,
    data,
  };
  context.commit(CGTEAMWORK_TASK.READ, mutationPayload);
}

const actions: ActionTree<ICGTeamworkTaskState, IRootState> = {
  async [CGTEAMWORK_TASK.READ](
    context,
    payload: ICGTeamWorkTaskReadActionPayload
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
    payload: ICGTeamWorkTaskUpdateFieldActionPayload
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
    payload: ICGTeamWorkTaskCreateNoteActionPayload
  ) {
    return axios.post(`api/task_note/${payload.id}`, { text: payload.text });
  },
};

const module: Module<ICGTeamworkTaskState, IRootState> = {
  state,
  getters,
  mutations,
  actions,
};

export default module;
