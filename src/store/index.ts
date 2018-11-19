import { getDataFromAppElement } from '@/datatools';
import {
  PageResponse,
  parseCGTeamWorkTaskResponse,
  TaskStage,
} from '@/interface';
import { isFileProtocol } from '@/packtools';
import Axios, { AxiosResponse } from 'axios';
import { isUndefined } from 'util';
import Vue from 'vue';
import { DefaultComputed } from 'vue/types/options';
import { mapState, StoreOptions } from 'vuex';
import * as mutations from '../mutation-types';
import cgTeamworkTaskStore from './cgteamwork-task';
import tagStore from './tag';
import { RootState, StatusSelectResult } from './types';
import videoStore from './video';

export function getDefaultStatusFilter(): StatusSelectResult {
  return {
    Close: false,
    Retake: true,
    Wait: true,
    Check: true,
    Approve: true,
    Unset: true,
  };
}

const store: Store = {
  strict: process.env.NODE_ENV !== 'production',
  state: {
    isEnablePreview: true,
    isFixedTitleDisplay: false,
    isFixedStatusDisplay: false,
    isEditingTags: false,
    statusStage: isFileProtocol ? TaskStage.director : TaskStage.leader,
    labelFilter: '',
    artistFilter: [],
    tagTextFilter: [],
    statusFilter: getDefaultStatusFilter(),
  },
  modules: {
    videoStore,
    cgTeamworkTaskStore,
    tagStore,
  },
  mutations: {
    [mutations.UPDATE_ROOT_STATE](
      state,
      payload: mutations.StateUpdateMutationPayload<RootState>
    ) {
      state[payload.key] = payload.value;
    },
  },
  actions: {
    [mutations.REFETCH_PAGE_DATA](contextState) {
      Axios.get(location.href).then((value: AxiosResponse<PageResponse>) => {
        value.data.videos.forEach(i => {
          const payload: mutations.VideoUpdateMutationPayload = {
            id: i.uuid,
            data: i,
          };
          contextState.commit(mutations.VIDEO.UPDATE, payload);
        });
        value.data.tags.forEach(i => {
          const payload: mutations.TagUpdateMutationPayload = {
            id: i.id,
            data: i,
          };
          contextState.commit(mutations.TAG.UPDATE, payload);
        });
        if (value.data.tasks) {
          value.data.tasks.forEach(i => {
            const task = parseCGTeamWorkTaskResponse(i);
            const payload: mutations.CGTeamWorkTaskReadMutationPayload = {
              id: task.id,
              data: task,
            };
            contextState.commit(mutations.CGTEAMWORK_TASK.READ, payload);
          });
        }
      });
    },
  },
  getters: {
    tagFilter(contextState, contextGetters) {
      return contextGetters.getTagByTextArray(contextState.tagTextFilter);
    },
  },
};

interface Store extends StoreOptions<RootState> {
  state: RootState;
  modules: {
    videoStore: typeof videoStore;
    cgTeamworkTaskStore: typeof cgTeamworkTaskStore;
    tagStore: typeof tagStore;
  };
}

type stateMap<T> = { [name in keyof T]: () => T[name] };

interface RootComputedMixin extends DefaultComputed, stateMap<RootState> {}

export const RootComputedMixin = {
  ...mapState(Object.keys(store.state)),
} as RootComputedMixin;

export function stateSetter<T, P extends T[K], K extends keyof T = keyof T>(
  type: string,
  key: K
) {
  return function(this: Vue, value: P) {
    const payload: mutations.StateUpdateMutationPayload<T> = {
      key,
      value,
    };
    this.$store.commit(type, payload);
  };
}

export function mapWritableState<
  T,
  P extends T[K],
  K extends keyof T = keyof T
>(key: K, type: string, module?: keyof Store['modules']) {
  return {
    get(this: Vue): P {
      const stateStore: T = isUndefined(module)
        ? this.$store.state
        : this.$store.state[module];
      return stateStore[key] as P;
    },
    set: stateSetter<T, P>(type, key),
  };
}

export const mapRootStateModelMixin = {
  isEnablePreviewModel: mapWritableState<RootState, boolean>(
    'isEnablePreview',
    mutations.UPDATE_ROOT_STATE
  ),
  isFixedTitleDisplayModel: mapWritableState<RootState, boolean>(
    'isFixedTitleDisplay',
    mutations.UPDATE_ROOT_STATE
  ),
  isFixedStatusDisplayModel: mapWritableState<RootState, boolean>(
    'isFixedStatusDisplay',
    mutations.UPDATE_ROOT_STATE
  ),
  isEditingTagsModel: mapWritableState<RootState, boolean>(
    'isEditingTags',
    mutations.UPDATE_ROOT_STATE
  ),
  statusStageModel: mapWritableState<RootState, TaskStage>(
    'statusStage',
    mutations.UPDATE_ROOT_STATE
  ),
  labelFilterModel: mapWritableState<RootState, string>(
    'labelFilter',
    mutations.UPDATE_ROOT_STATE
  ),
  artistFilterModel: mapWritableState<RootState, string[]>(
    'artistFilter',
    mutations.UPDATE_ROOT_STATE
  ),
  tagTextFilterModel: mapWritableState<RootState, string[]>(
    'tagTextFilter',
    mutations.UPDATE_ROOT_STATE
  ),
  statusFilterModel: mapWritableState<RootState, StatusSelectResult>(
    'statusFilter',
    mutations.UPDATE_ROOT_STATE
  ),
};
export default store;
