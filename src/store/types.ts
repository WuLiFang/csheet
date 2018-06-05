import { VideoResponse, CGTeamWorkTaskData } from '../interface';

export interface IDMap<T> {
  [id: string]: T;
}

export interface RootState {
  username: string;
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

export interface CombinedRootState extends RootState {
  videoStore: VideoState;
  cgTeamworkTaskStore: CGTeamworkTaskState;
}
