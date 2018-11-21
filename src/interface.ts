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
  [id: string]: T | undefined;
}

export type CGTeamWorkTaskResponse = [
  string,
  string | null,
  TaskStatusText | null,
  TaskStatusText | null,
  TaskStatusText | null,
  number,
  string,
  StringMap<boolean>
];

export function parseCGTeamWorkTaskResponse(
  response: CGTeamWorkTaskResponse
): CGTeamWorkTaskData {
  return {
    pipeline: response[0],
    artist: response[1] || '',
    artist_array: (response[1] || '').split(','),
    leader_status: TaskStatus[response[2] || 'Unset'],
    director_status: TaskStatus[response[3] || 'Unset'],
    client_status: TaskStatus[response[4] || 'Unset'],
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
  Unset,
}

export enum TaskStage {
  leader,
  director,
  client,
}

export type TaskStatusText = keyof typeof TaskStatus;

export interface VideoResponse {
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

export interface FieldResponse {
  has_permission: boolean;
  value: TaskStatusText | null;
}

export interface TagResponse {
  id: number;
  text: string;
  videos: string[];
}

export interface PageResponse {
  videos: VideoResponse[];
  tags: TagResponse[];
  tasks?: CGTeamWorkTaskResponse[];
}
