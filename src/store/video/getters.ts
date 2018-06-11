import { TaskStatus, VideoResponse, VideoRole } from '@/interface';
import {
  CombinedGetters,
  CombinedRootState,
  ElementHub,
  RootState,
  VideoState,
} from '@/store/types';
import * as _ from 'lodash';
import { isNull } from 'util';
import { GetterTree } from 'vuex';
import { getPath } from './core';

export const elementHub: ElementHub = new Map<string, HTMLElement>();
export const getters: GetterTree<VideoState, RootState> = {
  getVideoURI(contextState) {
    return (id: string, role: VideoRole, isForce = false) => {
      const data = contextState.storage[id];
      if (!data) {
        return null;
      }
      return getPath(data, role, isForce);
    };
  },
  scrollTo() {
    return (id: string) => {
      const element = elementHub.get(id);
      if (element) {
        window.scroll(undefined, element.offsetTop);
      }
    };
  },
  getBlobURL(contextState, contextGetter) {
    return (id: string, role: VideoRole, isForce = false) => {
      const url = contextGetter.getVideoURI(id, role, isForce);
      if (!url) {
        return null;
      }
      return contextState.blobURLMap[url] || null;
    };
  },
  videoElementHub() {
    return elementHub;
  },
  filterByStatus(contextState, contextGetter, rootState) {
    const castRootState = rootState as CombinedRootState;
    return (video: VideoResponse): boolean => {
      const status: TaskStatus = contextGetter.getGeneralStatus(
        video.uuid,
        castRootState.statusStage,
      );
      if (status === null && !castRootState.statusFilter.other) {
        return false;
      } else if (status !== null && !castRootState.statusFilter[status]) {
        return false;
      }
      return true;
    };
  },
  filterByLabel(contextState, contextGetter, rootState) {
    return (video: VideoResponse): boolean => {
      if (!rootState.labelFilter) {
        return true;
      }
      return new RegExp(rootState.labelFilter, 'i').test(video.label);
    };
  },
  filterByArtist(contextState, contextGetter, rootState) {
    return (video: VideoResponse): boolean => {
      if (rootState.artistFilter.length === 0) {
        return true;
      }
      return video.related_tasks.some(i => {
        const task = (rootState as CombinedRootState).cgTeamworkTaskStore
          .storage[i];
        return (
          task &&
          task.artist_array.some(j => rootState.artistFilter.includes(j))
        );
      });
    };
  },
  filterByTag(contextState, contextGetter, rootState) {
    const castGetters = contextGetter as CombinedGetters;
    const castRootState = rootState as CombinedRootState;
    return (video: VideoResponse): boolean => {
      const tagFilter = castRootState.tagTextFilter;
      if (tagFilter.length === 0) {
        return true;
      }
      return castGetters.getTagByTextArray(tagFilter).every(i => {
        return video.tags.includes(i.id);
      });
    };
  },
  filter(contextState, contextGetter) {
    const castGetters = contextGetter as CombinedGetters;
    return (video: VideoResponse) => {
      return (
        castGetters.filterByArtist(video) &&
        castGetters.filterByTag(video) &&
        castGetters.filterByStatus(video) &&
        castGetters.filterByLabel(video)
      );
    };
  },
  videoPlayList(contextState, contextGetter): string[] {
    return _.reject(contextState.visibleVideos, i =>
      isNull(contextState.storage[i].preview_mtime),
    );
  },
  imagePlayList(contextState, contextGetter): string[] {
    return _.reject(contextState.visibleVideos, i =>
      isNull(contextState.storage[i].poster_mtime),
    );
  },
  selectedVideos(contextState): string[] {
    return Object.keys(contextState.selectStateMap).filter(
      i => contextState.selectStateMap[i],
    );
  },
};

export default getters;
