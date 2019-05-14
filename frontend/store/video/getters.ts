import {
  TaskStatus,
  TaskStatusText,
  VideoResponse,
  VideoRole,
} from '@/interface';
import { isFileProtocol } from '@/packtools';
import {
  CombinedGetters,
  CombinedRootState,
  ElementHub,
  RootState,
  VideoState,
} from '@/store/types';
import { getPath } from '@/store/video/core';
import { GetterTree } from 'vuex';

export const elementHub: ElementHub = new Map<string, HTMLElement>();
export const getters: GetterTree<VideoState, RootState> = {
  getVideoURI(contextState) {
    return (id: string, role: VideoRole, isForce: boolean = false) => {
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
        window.scroll(element.offsetLeft, element.offsetTop);
      }
    };
  },
  getBlobURL(contextState, contextGetter) {
    return (id: string, role: VideoRole, isForce: boolean = false) => {
      const url = (contextGetter as CombinedGetters).getVideoURI(
        id,
        role,
        isForce
      );
      if (isFileProtocol) {
        return url;
      }
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
        castRootState.statusStage
      );
      return castRootState.statusFilter[TaskStatus[status] as TaskStatusText];
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
        if (!task) {
          return true;
        }
        return (
          task && task.artists.some(j => rootState.artistFilter.includes(j))
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
    return contextState.visibleVideos.filter(i => {
      const video = contextState.storage[i];
      return video && video.preview && video.preview_mtime;
    });
  },
  imagePlayList(contextState, contextGetter): string[] {
    return contextState.visibleVideos.filter(i => {
      const video = contextState.storage[i];
      return video && video.poster && video.poster_mtime;
    });
  },
  selectedVideos(contextState): string[] {
    return Object.keys(contextState.selectStateMap).filter(
      i => contextState.selectStateMap[i]
    );
  },
};

export default getters;
