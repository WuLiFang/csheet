import { VideoResponse, CGTeamWorkTaskData } from '../interface';

export interface IDMap<T> {
    [id: string]: T;
}

export type RootState = object;

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
    posterStatusMap: IDMap<LoadStatus>;
    // visibilityMap: IDMap<boolean>;
    // appearingMap: IDMap<boolean>;
    // positionMap: IDMap<PositionData>;
}

export interface CGTeamworkTaskState {
    storage: IDMap<CGTeamWorkTaskData>;
}

export interface CombinedRootState extends RootState {
    videoStore: VideoState;
    cgTeamworkTaskStore: CGTeamworkTaskState;
}
