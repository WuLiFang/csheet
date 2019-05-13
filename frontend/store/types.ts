import { Store } from 'vuex';
import {
  CGTeamWorkTaskResponse,
  TagResponse,
  TaskStage,
  TaskStatus,
  VideoResponse,
  VideoRole,
} from '../interface';

export interface IDMap<T> {
  [id: string]: T | undefined;
}

export interface RootState {
  isEnablePreview: boolean;
  isFixedTitleDisplay: boolean;
  isFixedStatusDisplay: boolean;
  isEditingTags: boolean;
  statusStage: TaskStage;
  labelFilter: string;
  artistFilter: string[];
  tagTextFilter: string[];
  statusFilter: StatusSelectResult;
}
export type StatusSelectResult = { [name in keyof typeof TaskStatus]: boolean };

export enum LoadStatus {
  notReady,
  ready,
  failed,
}

export interface PositionData {
  top: number;
  bottom: number;
}
export interface VideoState {
  storage: IDMap<VideoResponse>;
  blobURLMap: IDMap<string>;
  blobWhiteListMap: Map<string, string[] | undefined>;
  selectStateMap: IDMap<boolean>;
  visibleVideos: string[];
}

export interface CGTeamworkTaskState {
  storage: IDMap<CGTeamWorkTaskResponse>;
}

export interface TagState {
  storage: IDMap<TagResponse>;
}

export interface CombinedRootState extends RootState {
  videoStore: VideoState;
  cgTeamworkTaskStore: CGTeamworkTaskState;
  tagStore: TagState;
}

export type mapGettersMixin<T> = { [K in keyof T]: () => T[K] };
export interface CGTeamWorkTaskGetters {
  getGeneralStatus: (id: string, stage?: TaskStage) => TaskStatus;
  artists: string[];
  getArtistTaskCount: (artist: string) => number;
}

export type ElementHub = Map<string, HTMLElement | undefined>;
export interface VideoGetters {
  scrollTo: (id: string) => void;
  getVideoURI: (
    id: string,
    role: VideoRole,
    isForce?: boolean
  ) => string | null;
  getBlobURL: (id: string, role: VideoRole, isForce?: boolean) => string | null;
  videoElementHub: ElementHub;
  filterByStatus: (video: VideoResponse) => boolean;
  filterByLabel: (video: VideoResponse) => boolean;
  filterByArtist: (video: VideoResponse) => boolean;
  filterByTag: (video: VideoResponse) => boolean;
  filter: (video: VideoResponse) => boolean;
  videoVisibilityMap: IDMap<boolean>;
  videoPlayList: string[];
  imagePlayList: string[];
  selectedVideos: string[];
}

export interface TagStoreByText {
  [id: string]: TagResponse[] | undefined;
}
export interface TagGetters {
  tags: TagResponse[];
  tagStoreByText: TagStoreByText;
  getTagByTextArray: (textArray: string[]) => TagResponse[];
}

export interface RootGetters {
  tagFilter: TagResponse[];
}
export interface CombinedGetters
  extends RootGetters,
    VideoGetters,
    TagGetters,
    CGTeamWorkTaskGetters {}
export declare class DollarStore extends Store<CombinedRootState> {
  readonly getters: CombinedGetters;
}
