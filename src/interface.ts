export interface CGTeamWorkTaskData {
  pipeline: string;
  artist: string;
  artist_array: string[];
  leader_status: TaskStatus;
  director_status: TaskStatus;
  client_status: TaskStatus;
  note_num: number;
  id: string;
  permissions: StringMap<boolean>;
}

export interface StringMap<T> {
  [id: string]: T;
}

export type CGTeamWorkTaskResponse = [
  string,
  string,
  TaskStatusText,
  TaskStatusText,
  TaskStatusText,
  number,
  string,
  StringMap<boolean>
];

export function parseCGTeamWorkTaskResponse(
  response: CGTeamWorkTaskResponse,
): CGTeamWorkTaskData {
  return {
    pipeline: response[0],
    artist: response[1],
    artist_array: response[1] ? response[1].split(',') : [],
    leader_status: TaskStatus[response[2]],
    director_status: TaskStatus[response[3]],
    client_status: TaskStatus[response[4]],
    note_num: response[5],
    id: response[6],
    permissions: response[7],
  };
}

export enum TaskStatus {
  // First appeared status take priority.
  Close,
  Retake,
  Wait,
  Check,
  Approve,
}

export enum TaskStage {
  leader,
  director,
  client,
}

export type TaskStatusText = 'Wait' | 'Check' | 'Approve' | 'Retake' | 'Close';

export interface VideoResponse {
  database: string;
  module: string;
  is_need_update: boolean;
  label: string;
  last_update_time: number;
  pipeline: string;
  poster: string;
  poster_atime: number;
  poster_mtime: number;
  preview: string;
  preview_atime: number;
  preview_mtime: number;
  src: string;
  src_mtime: number;
  thumb: string;
  thumb_atime: number;
  thumb_mtime: number;
  uuid: string;
  related_tasks: string[];
  tags: Array<string | number>;
}

export enum VideoRole {
  thumb = 'thumb',
  poster = 'poster',
  preview = 'preview',
}

export interface FieldResponse {
  has_permission: boolean;
  value: TaskStatusText | null;
}

export interface TagResponse {
  id: number;
  text: string;
  videos: string[];
}
