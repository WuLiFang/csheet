import { TaskDataModel, TaskInfoResponse, TaskStatus, VideoResponse, FieldResponse } from "./interface";
import axios from "axios";
import Vue from "vue";

import { Message } from "element-ui";

interface TaskDataHub {
    [id: string]: Array<TaskDataModel>;
}
interface VideoHub {
    [id: string]: VideoResponse
}

export interface FieldMap {
    [field: string]: FieldResponse
}
interface FieldHub {
    [id: string]: FieldMap
}

function parseReponse(response: TaskInfoResponse, order: number): TaskDataModel {
    return {
        pipeline: response[0],
        artist: response[1],
        leader_status: TaskStatus[response[2]],
        director_status: TaskStatus[response[3]],
        client_status: TaskStatus[response[4]],
        note_num: response[5],
        id: response[6],
        order,
    };
}


export async function requestTaskData(id: string) {
    return axios.get(`/api/task/${id}`).then(response => {
        let data: Array<TaskInfoResponse> = response.data;
        Vue.set(taskDataHub, id, data.map((i, index) => parseReponse(i, index)));
        return response;
    });
}

export async function requestVideoData(id: string) {
    return axios.get(`/api/video/${id}`).then(response => {
        let data: VideoResponse = response.data;
        Vue.set(videoHub, id, data);
        return response;
    });
}

export async function requestFieldData(videoId: string, taskId: string, field: string) {
    return axios.get(`/api/video/${videoId}/task/${taskId}/${field}`).then(response => {
        let data: FieldResponse = response.data;
        let map = fieldHub[taskId]
        if (!map) {
            map = {}
            Vue.set(fieldHub, taskId, map)
        }
        Vue.set(map, field, data);
        return response;
    });
}

export async function approve(videoId: string, taskId: string, field: string) {
    return axios.put(`/api/video/${videoId}/task/${taskId}/${field}`, { value: 'Approve' }).then(
        response => {
            Message({ message: '镜头设为通过', type: 'success' })
            requestFieldData(videoId, taskId, field)
            return response
        }
    ).catch(
        errorMessage
    )

}

function errorMessage(error: any) {
    Message({ message: error.response.data, type: 'error' })
}

export async function retake(videoId: string, taskId: string, field: string, reason?: string) {
    return axios.put(`/api/video/${videoId}/task/${taskId}/${field}`, { value: 'Retake' }).then(
        response => {
            Message({ message: '镜头设为返修', type: 'success' })
            requestFieldData(videoId, taskId, field)
            if (reason) {
                addNote(videoId, taskId, `返修原因: ${reason}`)
            }
            return response
        }
    ).catch(
        errorMessage
    )

}

export async function addNote(videoId: string, taskId: string, text: string) {
    return axios.post(`api/video/${videoId}/task_note/${taskId}`, { text }).then(
        response => {
            Message({ message: '已添加备注', type: 'success' })
            return response
        }
    ).catch(
        errorMessage
    )
}

export const taskDataHub: TaskDataHub = {};
export const videoHub: VideoHub = {}
export const fieldHub: FieldHub = {}