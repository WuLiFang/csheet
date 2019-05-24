import {
  ICGTeamWorkTaskResponse,
  ITagResponse,
  IVideoResponse,
  VideoRole,
} from '@/interface';
import { IDMap, IPositionData } from '@/store/types';

export enum VIDEO {
  // CREATE = 'create_video',
  READ = 'read_video',
  UPDATE = 'update_video',
  // DELETE = 'delete_video'
}

interface IVideoIdPayload {
  id: string;
}
export interface IVideoUpdateActionPayload extends IVideoIdPayload {
  data: {
    key: keyof IVideoResponse;
    value: any;
  };
}
export interface IVideoUpdateMutationPayload extends IVideoIdPayload {
  data: IVideoResponse;
}

export type VideoReadActionPayload = IVideoIdPayload;

export const UPDATE_VIDEO_POSITION = 'update_video_position';
export interface IVideoUpdatePositionMutationPayload {
  id: string;
  data: IPositionData;
}

export const SET_VIDEO_VISIBILITY = 'set_video_visibility';

export interface IVideoSetVisibilityMutationPayload {
  id: string;
  value: boolean;
}

export const UPDATE_VIDEO_APPEARING = 'update_video_appearing';
export const FILTER_VIDEOS = 'filter_videos';

export interface IVideoUpdateAppearingMutationPayload {
  id: string;
  value?: boolean;
}
export const PRELOAD_VIDEO = 'preload_video';
export const UPDATE_VIDEO_SELECT_STATE = 'update_video_select_state';
export type VideoUpdateSelectStateMutationPayload = IDMap<boolean>;
export interface IVideoPreloadActionPayload {
  id: string;
  role: VideoRole;
  onprogress?: (
    event: ProgressEvent,
    config: IVideoPreloadActionPayload
  ) => void;
}
export const UPDATE_BLOB_HUB = 'update_blob_hub';
export interface IUpdateBlobHubMutationPayload {
  url: string;
  blob: Blob;
}

export const PRELOAD_URL = 'preload_url';
export interface IPreloadURLActionPayload {
  url: string;
  onprogress?: (event: ProgressEvent) => void;
}

export const CLEAR_VIDEO_BLOB = 'clear_video_blob';
export interface IVideoClearBlobMutationPayload {
  id: string;
}

export const UPDATE_VIDEO_BLOB_WHITELIST = 'update_video_blob_whitelist';
export interface IVideoUpdateBlobWhiteListMapMutationPayload {
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

export interface ICGTeamWorkTaskReadMutationPayload {
  id: string;
  data: ICGTeamWorkTaskResponse;
}

export interface ICGTeamWorkTaskReadActionPayload {
  id: string;
}

export interface ICGTeamWorkTaskUpdateMutationPayload {
  id: string;
  key: string;
  value: string;
}

export const UPDATE_CGTEAMWORK_TASK_FIELD = 'update_cgteamwork_task_field';

export interface ICGTeamWorkTaskUpdateFieldActionPayload {
  id: string;
  field: string;
  data: {
    value: string;
    is_status?: boolean;
    message?: string;
  };
}

export const CREATE_CGTEAMWORK_TASK_NOTE = 'create_cgteamwork_task_note';

export interface ICGTeamWorkTaskCreateNoteActionPayload {
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
interface ITagIdPayload {
  id: TagId;
}
export interface ITagCreateActionPayload {
  data: { text: string };
}

export type TagReadActionPayload = ITagIdPayload;

export interface ITagUpdateActionPayload extends ITagIdPayload {
  data: { text: string };
}
export interface ITagUpdateMutationPayload extends ITagIdPayload {
  data: ITagResponse;
}

export type TagDeleteActionPayload = ITagIdPayload;
export type TagDeleteMutationPayload = ITagIdPayload;

export const VIDEOS_ADD_TAG = 'videos_add_tag';

export interface IVideosAddTagActionPayload extends ITagIdPayload {
  data: { videos: string[] };
}
export interface IVideosAddTagMutationsPayload extends ITagIdPayload {
  videos: string[];
}

export enum VIDEO_TAGS {
  CREATE = 'create_video_tags',
  READ = 'read_video_tags',
  UPDATE = 'update_video_tags',
  DELETE = 'delete_video_tags',
}
export type VideoTagsReadActionPayload = IVideoIdPayload;

export interface IVideoTagsCreateActionPayload extends IVideoIdPayload {
  data: {
    tags: TagId[];
  };
}
export interface IVideoTagsUpdateActionPayload extends IVideoIdPayload {
  data: {
    tags: TagId[];
  };
}

export interface IVideoTagsDeleteActionPayload extends IVideoIdPayload {
  data: {
    tags: TagId[];
  };
}

export const READ_VIDEO_TAGS_IF_FOUND_UNDEFINED =
  'read_video_tags_if_found_undefined';

export interface IVideoTagsReadIfFoundUndefinedActionPayload {
  video: IVideoResponse;
}
export const UPDATE_ROOT_STATE = 'update_root_state';

export interface IStateUpdateMutationPayload<T, K extends keyof T = keyof T> {
  key: K;
  value: T[K];
}

export const UPDATE_VIDEO_STATE = 'update_video_state';
export const REFETCH_PAGE_DATA = 'REFETCH_PAGE_DATA';
