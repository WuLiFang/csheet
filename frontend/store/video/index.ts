import {
  IRootState,
  IVideoGetters,
  IVideoState,
  mapGettersMixin,
} from '@/store/types';
import actions from '@/store/video/actions';
import { getters } from '@/store/video/getters';
import mutations from '@/store/video/mutations';
import state from '@/store/video/state';
import { DefaultComputed } from 'vue/types/options';
import { mapGetters, mapState, Module } from 'vuex';

interface VideoComputedMixin
  extends DefaultComputed,
    mapGettersMixin<IVideoGetters> {
  videoStore: () => IVideoState;
}

export const videoComputedMixin = {
  ...mapState(['videoStore']),
  ...mapGetters(Object.keys(getters)),
} as VideoComputedMixin;

const module: Module<IVideoState, IRootState> = {
  actions,
  getters,
  mutations,
  state,
};

export default module;
