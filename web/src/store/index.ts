import { PAGE_PATH } from '@/constants';
import { IPageResponse, TaskStage } from '@/interface';
import * as mutations from '@/mutation-types';
import { isFileProtocol } from '@/packtools';
import { default as cgTeamworkTaskStore } from '@/store/cgteamwork-task';
import { default as tagStore } from '@/store/tag';
import { IRootState, StatusSelectResult } from '@/store/types';
import { default as videoStore } from '@/store/video';
import Axios, { AxiosResponse } from 'axios';
import Vue from 'vue';
import { DefaultComputed } from 'vue/types/options';
import { mapState, StoreOptions } from 'vuex';

export function getDefaultStatusFilter(): StatusSelectResult {
  return {
    Approve: true,
    Check: true,
    Close: false,
    Retake: true,
    Unset: true,
    Wait: true,
  };
}

export const store: IStore = {
  actions: {
    [mutations.REFETCH_PAGE_DATA](contextState) {
      Axios.get(`/api/page${PAGE_PATH}`).then(
        (value: AxiosResponse<IPageResponse>) => {
          value.data.videos.forEach(i => {
            const payload: mutations.IVideoUpdateMutationPayload = {
              data: i,
              id: i.uuid,
            };
            contextState.commit(mutations.VIDEO.UPDATE, payload);
          });
          value.data.tags.forEach(i => {
            const payload: mutations.ITagUpdateMutationPayload = {
              data: i,
              id: i.id,
            };
            contextState.commit(mutations.TAG.UPDATE, payload);
          });
          if (value.data.tasks) {
            value.data.tasks.forEach(i => {
              const payload: mutations.ICGTeamWorkTaskReadMutationPayload = {
                data: i,
                id: i.uuid,
              };
              contextState.commit(mutations.CGTEAMWORK_TASK.READ, payload);
            });
          }
          contextState.dispatch(mutations.FILTER_VIDEOS);
        }
      );
    },
  },
  getters: {
    tagFilter(contextState, contextGetters) {
      return contextGetters.getTagByTextArray(contextState.tagTextFilter);
    },
  },
  modules: {
    cgTeamworkTaskStore,
    tagStore,
    videoStore,
  },
  mutations: {
    [mutations.UPDATE_ROOT_STATE](
      state,
      payload: mutations.IStateUpdateMutationPayload<IRootState>
    ) {
      state[payload.key] = payload.value;
    },
  },
  state: {
    artistFilter: [],
    isEditingTags: false,
    isEnablePreview: true,
    isFixedStatusDisplay: false,
    isFixedTitleDisplay: false,
    labelFilter: '',
    statusFilter: getDefaultStatusFilter(),
    statusStage: isFileProtocol ? TaskStage.director : TaskStage.leader,
    tagTextFilter: [],
  },
  strict: process.env.NODE_ENV !== 'production',
};

interface IStore extends StoreOptions<IRootState> {
  state: IRootState;
  modules: {
    videoStore: typeof videoStore;
    cgTeamworkTaskStore: typeof cgTeamworkTaskStore;
    tagStore: typeof tagStore;
  };
}

type stateMap<T> = { [name in keyof T]: () => T[name] };

interface IRootComputedMixin extends DefaultComputed, stateMap<IRootState> {}

export const RootComputedMixin = {
  ...mapState(Object.keys(store.state)),
} as IRootComputedMixin;

export function stateSetter<T, P extends T[K], K extends keyof T = keyof T>(
  type: string,
  key: K
) {
  return function(this: Vue, value: P) {
    const payload: mutations.IStateUpdateMutationPayload<T> = {
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
>(key: K, type: string, module?: keyof IStore['modules']) {
  return {
    get(this: Vue): P {
      const stateStore: T =
        module === undefined ? this.$store.state : this.$store.state[module];
      return stateStore[key] as P;
    },
    set: stateSetter<T, P>(type, key),
  };
}

export const mapRootStateModelMixin = {
  artistFilterModel: mapWritableState<IRootState, string[]>(
    'artistFilter',
    mutations.UPDATE_ROOT_STATE
  ),
  isEditingTagsModel: mapWritableState<IRootState, boolean>(
    'isEditingTags',
    mutations.UPDATE_ROOT_STATE
  ),
  isEnablePreviewModel: mapWritableState<IRootState, boolean>(
    'isEnablePreview',
    mutations.UPDATE_ROOT_STATE
  ),
  isFixedStatusDisplayModel: mapWritableState<IRootState, boolean>(
    'isFixedStatusDisplay',
    mutations.UPDATE_ROOT_STATE
  ),
  isFixedTitleDisplayModel: mapWritableState<IRootState, boolean>(
    'isFixedTitleDisplay',
    mutations.UPDATE_ROOT_STATE
  ),
  labelFilterModel: mapWritableState<IRootState, string>(
    'labelFilter',
    mutations.UPDATE_ROOT_STATE
  ),
  statusFilterModel: mapWritableState<IRootState, StatusSelectResult>(
    'statusFilter',
    mutations.UPDATE_ROOT_STATE
  ),
  statusStageModel: mapWritableState<IRootState, TaskStage>(
    'statusStage',
    mutations.UPDATE_ROOT_STATE
  ),
  tagTextFilterModel: mapWritableState<IRootState, string[]>(
    'tagTextFilter',
    mutations.UPDATE_ROOT_STATE
  ),
};
export default store;