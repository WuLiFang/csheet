import {
  VideoResponse,
  CGTeamWorkTaskData,
  VideoRole,
  TagResponse,
} from './interface';
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
export const PRELOAD_VIDEO = 'preload_video';

export interface VideoPreloadActionPayload {
  id: string;
  role: VideoRole;
}
export const UPDATE_BLOB_HUB = 'update_blob_hub';
export interface UpdateBlobHubMutationPayload {
  url: string;
  blob: Blob;
}

export const PRELOAD_URL = 'preload_url';
export interface PreloadURLActionPayload {
  url: string;
}

export const CLEAR_VIDEO_BLOB = 'clear_video_blob';
export interface VideoClearBlobMutationPayload {
  id: string;
}

export const UPDATE_VIDEO_BLOB_WHITELIST = 'update_video_blob_whitelist';
export interface VideoUpdateBlobWhiteListMapMutationPayload {
  key: string;
  value: string[];
}

export const UPDATE_VIDEO_APPEARED = 'update_video_appeared';

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

export enum TAG {
  CREATE = 'create_tag',
  READ = 'read_tag',
  UPDATE = 'update_tag',
  DELETE = 'delete_tag',
}

export interface TagId {
  id: string | number;
}
export interface TagCreateActionPayload {
  data: { text: string };
}

export type TagReadActionPayload = TagId;

export interface TagUpdateActionPayload extends TagId {
  data: { text: string };
}
export interface TagUpdateMutationPayload extends TagId {
  data: TagResponse;
}

export type TagDeleteActionPayload = TagId;
export type TagDeleteMutationPayload = TagId;

export const VIDEOS_ADD_TAG = 'videos_add_tag';

export interface VideosAddTagActionPayload extends TagId {
  data: { videos: string[] };
}
export interface VideosAddTagMutationsPayload extends TagId {
  videos: string[];
}
