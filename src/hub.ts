import { TaskDataModel, TaskInfoResponse, TaskStatus, VideoResponse } from "./interface";
import axios from "axios";
import Vue from "vue";

interface TaskDataHub {
    [id: string]: Array<TaskDataModel>;
}
interface VideoHub {
    [id: string]: VideoResponse
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
        order
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

export const taskDataHub: TaskDataHub = {};
export const videoHub: VideoHub = {}