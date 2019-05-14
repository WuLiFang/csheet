import {
  mapGettersMixin,
  RootState,
  VideoGetters,
  VideoState,
} from '@/store/types';
import actions from '@/store/video/actions';
import { getters } from '@/store/video/getters';
import mutations from '@/store/video/mutations';
import state from '@/store/video/state';
import { DefaultComputed } from 'vue/types/options';
import { mapGetters, mapState, Module } from 'vuex';

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
  actions,
  getters,
  mutations,
  state,
};

export default module;
