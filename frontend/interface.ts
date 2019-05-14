export interface IStringMap<T> {
  [id: string]: T | undefined;
}

export interface ICGTeamWorkTaskResponse {
  uuid: string;
  database: string;
  module: string;
  shot: string;
  pipeline: string;
  artists: string[];
  leader_status: string;
  director_status: string;
  client_status: string;
  note_num: number;
  permissions: IStringMap<boolean> | undefined;
}

export enum TaskStatus {
  // First appeared status take priority.
  Close,
  Retake,
  Wait,
  Check,
  Approve,
  Unset,
}

export enum TaskStage {
  leader,
  director,
  client,
}

export type TaskStatusText = keyof typeof TaskStatus;

export interface IVideoResponse {
  database: string | null;
  module: string | null;
  is_need_update: boolean | null;
  label: string;
  last_update_time: number | null;
  pipeline: string | null;
  poster: string | null;
  poster_atime: number | null;
  poster_mtime: number | null;
  preview: string | null;
  preview_atime: number | null;
  preview_mtime: number | null;
  src: string | null;
  src_mtime: number | null;
  thumb: string | null;
  thumb_atime: number | null;
  thumb_mtime: number | null;
  uuid: string;
  related_tasks: string[];
  tags: Array<string | number>;
  src_broken_mtime: number | null;
}

export enum VideoRole {
  thumb = 'thumb',
  poster = 'poster',
  preview = 'preview',
}

export interface IFieldResponse {
  has_permission: boolean;
  value: TaskStatusText | null;
}

export interface ITagResponse {
  id: number;
  text: string;
  videos: string[];
}

export interface IPageResponse {
  videos: IVideoResponse[];
  tags: ITagResponse[];
  tasks?: ICGTeamWorkTaskResponse[];
}
