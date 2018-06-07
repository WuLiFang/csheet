import { VideoResponse, CGTeamWorkTaskData, TagResponse } from '../interface';

export interface IDMap<T> {
  [id: string]: T;
}

export interface RootState {
  username: string;
  isEnablePreview: boolean;
}

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
  blobWhiteListMap: Map<string, string[]>;
}

export interface CGTeamworkTaskState {
  storage: IDMap<CGTeamWorkTaskData>;
}

export interface TagState {
  storage: IDMap<TagResponse>;
}

export interface CombinedRootState extends RootState {
  videoStore: VideoState;
  cgTeamworkTaskStore: CGTeamworkTaskState;
  tagStore: TagState;
}
