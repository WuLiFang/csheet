import { VideoResponse, CGTeamWorkTaskData } from './interface';
import { LoadStatus, PositionData } from './store/types';

export enum VIDEO {
    // CREATE = 'create_video',
    READ = 'read_video',
    // UPDATE = 'update_video',
    // DELETE = 'delete_video'
}

export interface VideoReadMutationPayload {
    id: string;
    data: VideoResponse;
}

export interface VideoReadActionPayload {
    id: string;
}

// export const SET_VIDEO_ELEMENT = 'set_video_element';
// export interface VideoSetEelementMutationPayload {
//     id: string;
//     element: HTMLElement;
// }
export const UPDATE_VIDEO_POSITION = 'update_video_position';
export interface VideoUpdatePositionMutationPayload {
    id: string;
    data: PositionData;
}

export const SET_VIDEO_POSTER_STATUS = 'set_video_poster_status';

export interface VideoSetPosterStatusMutationPayload {
    id: string;
    status: LoadStatus;
}
export const LOAD_VIDEO_POSTER = 'load_video_poster';

export interface VideoLoadPosterActionPayload {
    id: string;
}

export const SET_VIDEO_VISIBILITY = 'set_video_visibility';

export interface VideoSetVisibilityMutationPayload {
    id: string;
    value: boolean;
}

export const UPDATE_VIDEO_APPEARING = 'update_video_appearing';

export interface VideoUpdateAppearingMutationPayload {
    id: string;
    value?: boolean;
}


export enum CGTEAMWORK_TASK {
    // CREATE = 'create_cgteamwork_task',
    READ = 'read_cgteamwork_task',
    UPDATE = 'update_cgteamwork_task',
    // DELETE = 'delete_cgteamwork_task'
}

export interface CGTeamWorkTaskReadMutationPayload {
    id: string;
    data: CGTeamWorkTaskData;
}

export interface CGTeamWorkTaskReadActionPayload {
    id: string;
}

export interface CGTeamWorkTaskUpdateMutationPayload {
    id: string;
    key: string;
    value: string;
}

export const UPDATE_CGTEAMWORK_TASK_FIELD = 'update_cgteamwork_task_field';

export interface CGTeamWorkTaskUpdateFieldActionPayload {
    id: string;
    field: string;
    reason?: string;
    data: {
        value: string;
    };
}

export const CREATE_CGTEAMWORK_TASK_NOTE = 'create_cgteamwork_task_note';

export interface CGTeamWorkTaskCreateNoteActionPayload {
    id: string;
    text: string;
}
