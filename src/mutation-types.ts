import {
  CGTeamWorkTaskData,
  TagResponse,
  VideoResponse,
  VideoRole,
} from './interface';
import { IDMap, PositionData } from './store/types';

export enum VIDEO {
  // CREATE = 'create_video',
  READ = 'read_video',
  UPDATE = 'update_video',
  // DELETE = 'delete_video'
}

interface VideoIdPayload {
  id: string;
}
export interface VideoUpdateMutationPayload extends VideoIdPayload {
  data: VideoResponse;
}

export type VideoReadActionPayload = VideoIdPayload;

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
export const FILTER_VIDEOS = 'filter_videos';

export interface VideoUpdateAppearingMutationPayload {
  id: string;
  value?: boolean;
}
export const PRELOAD_VIDEO = 'preload_video';
export const UPDATE_VIDEO_SELECT_STATE = 'update_video_select_state';
export type VideoUpdateSelectStateMutationPayload = IDMap<boolean>;
export interface VideoPreloadActionPayload {
  id: string;
  role: VideoRole;
  onprogress?: (
    event: ProgressEvent,
    config: VideoPreloadActionPayload,
  ) => void;
}
export const UPDATE_BLOB_HUB = 'update_blob_hub';
export interface UpdateBlobHubMutationPayload {
  url: string;
  blob: Blob;
}

export const PRELOAD_URL = 'preload_url';
export interface PreloadURLActionPayload {
  url: string;
  onprogress?: (event: ProgressEvent) => void;
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
  data: {
    value: string;
    is_status?: boolean;
    message?: string;
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

type TagId = string | number;
interface TagIdPayload {
  id: TagId;
}
export interface TagCreateActionPayload {
  data: { text: string };
}

export type TagReadActionPayload = TagIdPayload;

export interface TagUpdateActionPayload extends TagIdPayload {
  data: { text: string };
}
export interface TagUpdateMutationPayload extends TagIdPayload {
  data: TagResponse;
}

export type TagDeleteActionPayload = TagIdPayload;
export type TagDeleteMutationPayload = TagIdPayload;

export const VIDEOS_ADD_TAG = 'videos_add_tag';

export interface VideosAddTagActionPayload extends TagIdPayload {
  data: { videos: string[] };
}
export interface VideosAddTagMutationsPayload extends TagIdPayload {
  videos: string[];
}

export enum VIDEO_TAGS {
  CREATE = 'create_video_tags',
  READ = 'read_video_tags',
  UPDATE = 'update_video_tags',
  DELETE = 'delete_video_tags',
}
export type VideoTagsReadActionPayload = VideoIdPayload;

export interface VideoTagsCreateActionPayload extends VideoIdPayload {
  data: {
    tags: TagId[];
  };
}
export interface VideoTagsUpdateActionPayload extends VideoIdPayload {
  data: {
    tags: TagId[];
  };
}

export interface VideoTagsDeleteActionPayload extends VideoIdPayload {
  data: {
    tags: TagId[];
  };
}

export const READ_VIDEO_TAGS_IF_FOUND_UNDEFINED =
  'read_video_tags_if_found_undefined';

export interface VideoTagsReadIfFoundUndefinedActionPayload {
  video: VideoResponse;
}
export const UPDATE_ROOT_STATE = 'update_root_state';

export interface StateUpdateMutationPayload<T, K extends keyof T = keyof T> {
  key: K;
  value: T[K];
}

export const UPDATE_VIDEO_STATE = 'update_video_state';
