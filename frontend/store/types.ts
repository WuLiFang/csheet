import { Store } from 'vuex';
import {
  ICGTeamWorkTaskResponse,
  ITagResponse,
  IVideoResponse,
  TaskStage,
  TaskStatus,
  VideoRole,
} from '../interface';

export interface IDMap<T> {
  [id: string]: T | undefined;
}

export interface IRootState {
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

export interface IPositionData {
  top: number;
  bottom: number;
}
export interface IVideoState {
  storage: IDMap<IVideoResponse>;
  blobURLMap: IDMap<string>;
  blobWhiteListMap: Map<string, string[] | undefined>;
  selectStateMap: IDMap<boolean>;
  visibleVideos: string[];
}

export interface ICGTeamworkTaskState {
  storage: IDMap<ICGTeamWorkTaskResponse>;
}

export interface ITagState {
  storage: IDMap<ITagResponse>;
}

export interface ICombinedIRootState extends IRootState {
  videoStore: IVideoState;
  cgTeamworkTaskStore: ICGTeamworkTaskState;
  tagStore: ITagState;
}

export type mapGettersMixin<T> = { [K in keyof T]: () => T[K] };
export interface ICGTeamWorkTaskGetters {
  getGeneralStatus: (id: string, stage?: TaskStage) => TaskStatus;
  artists: string[];
  getArtistTaskCount: (artist: string) => number;
}

export type ElementHub = Map<string, HTMLElement | undefined>;
export interface IVideoGetters {
  scrollTo: (id: string) => void;
  getVideoURI: (
    id: string,
    role: VideoRole,
    isForce?: boolean
  ) => string | null;
  getBlobURL: (id: string, role: VideoRole, isForce?: boolean) => string | null;
  videoElementHub: ElementHub;
  filterByStatus: (video: IVideoResponse) => boolean;
  filterByLabel: (video: IVideoResponse) => boolean;
  filterByArtist: (video: IVideoResponse) => boolean;
  filterByTag: (video: IVideoResponse) => boolean;
  filter: (video: IVideoResponse) => boolean;
  videoVisibilityMap: IDMap<boolean>;
  videoPlayList: string[];
  imagePlayList: string[];
  selectedVideos: string[];
}

export interface ITagStoreByText {
  [id: string]: ITagResponse[] | undefined;
}
export interface ITagGetters {
  tags: ITagResponse[];
  ITagStoreByText: ITagStoreByText;
  getTagByTextArray: (textArray: string[]) => ITagResponse[];
}

export interface IRootGetters {
  tagFilter: ITagResponse[];
}
export interface ICombinedGetters
  extends IRootGetters,
    IVideoGetters,
    ITagGetters,
    ICGTeamWorkTaskGetters {}
export declare class DollarStore extends Store<ICombinedIRootState> {
  public readonly getters: ICombinedGetters;
}
