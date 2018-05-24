import axios from 'axios';
import Vue from 'vue';

import { Message } from 'element-ui';
import { IDMap } from './store/types';


export async function approve(taskId: string, field: string) {
    return axios.put(`/api/task/${taskId}/${field}`, { value: 'Approve' }).then(
        (response) => {
            Message({ message: '镜头设为通过', type: 'success' });
            return response;
        },
    ).catch(
        errorMessage,
    );

}

function errorMessage(error: any) {
    Message({ message: error.response.data, type: 'error' });
}

export async function retake(taskId: string, field: string, reason?: string) {
    return axios.put(`/api/task/${taskId}/${field}`, { value: 'Retake' }).then(
        (response) => {
            Message({ message: '镜头设为返修', type: 'success' });
            if (reason) {
                addNote(taskId, `返修原因: ${reason}`);
            }
            return response;
        },
    ).catch(
        errorMessage,
    );

}

export async function addNote(taskId: string, text: string) {
    return axios.post(`api/task_note/${taskId}`, { text }).then(
        (response) => {
            Message({ message: '已添加备注', type: 'success' });
            return response;
        },
    ).catch(
        errorMessage,
    );
}
