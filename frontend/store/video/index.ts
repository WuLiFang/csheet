import {
  mapGettersMixin,
  RootState,
  VideoGetters,
  VideoState,
} from '@/store/types';
import { DefaultComputed } from 'vue/types/options';
import { mapGetters, mapState, Module } from 'vuex';
import actions from './actions';
import { getters } from './getters';
import mutations from './mutations';
import state from './state';

interface VideoComputedMixin
  extends DefaultComputed,
    mapGettersMixin<VideoGetters> {
  videoStore: () => VideoState;
}

export const videoComputedMinxin = {
  ...mapState(['videoStore']),
  ...mapGetters(Object.keys(getters)),
} as VideoComputedMixin;

const module: Module<VideoState, RootState> = {
  state,
  getters,
  mutations,
  actions,
};

export default module;
