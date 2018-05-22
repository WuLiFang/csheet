export interface TaskDataModel {
    pipeline: string;
    artist: string;
    leader_status: TaskStatus;
    director_status: TaskStatus;
    client_status: TaskStatus;
    note_num: number;
    id: string;
    order: number;
    permissions: StringMap<boolean>
}

export interface StringMap<T> {
    [id: string]: T
}

export type TaskInfoResponse = [
    string,
    string,
    TaskStatusText,
    TaskStatusText,
    TaskStatusText,
    number,
    string,
    StringMap<boolean>
];

export enum TaskStatus {
    // First appeared status take priority.
    Close,
    Retake,
    Wait,
    Check,
    Approve,
}

export type TaskStatusText = "Wait" | "Check" | "Approve" | "Retake" | "Close"

interface taskInfo {
    task_id: Array<string>
}

export interface VideoResponse {
    database: string,
    is_need_update: boolean,
    label: string,
    last_update_time: number,
    pipeline: string,
    poster: string,
    poster_atime: number,
    poster_mtime: number,
    preview: string,
    preview_atime: number,
    preview_mtime: number,
    src: string,
    src_mtime: number,
    task_info?: taskInfo,
    thumb: string,
    thumb_atime: number,
    thumb_mtime: number,
    uuid: string
}

export interface FieldResponse {
    has_permission: boolean,
    value: TaskStatusText | null,
}