import Vue from 'vue';
import { Module, MutationTree, ActionTree, GetterTree, mapGetters, mapState } from 'vuex';
import { DefaultComputed } from 'vue/types/options';

import * as _ from 'lodash';
import axios from 'axios';

import { RootState, VideoState, IDMap, LoadStatus } from './types';
import {
    VIDEO,
    VideoReadMutationPayload,
    VideoReadActionPayload,
    SET_VIDEO_POSTER_STATUS,
    VideoSetPosterStatusMutationPayload,
    LOAD_VIDEO_POSTER,
    VideoLoadPosterActionPayload,
    SET_VIDEO_VISIBILITY,
    VideoSetVisibilityMutationPayload,
    UPDATE_VIDEO_APPEARING,
    VideoUpdateAppearingMutationPayload,
    UPDATE_VIDEO_POSITION,
    VideoUpdatePositionMutationPayload,
} from '../mutation-types';
import { VideoResponse, VideoRole } from '../interface';
import { isFileProtocol } from '../packtools';
import { imageAvailable } from '../image';

function getPackedPath(videoData: VideoResponse, role: VideoRole): string | null {
    if (!getMtime(videoData, role)) {
        return null;
    }
    let ret: string | null = null;
    switch (role) {
        case VideoRole.thumb: {
            ret = _getPackedPath(videoData, 'thumbs', '.jpg');
            break;
        }
        case VideoRole.poster: {
            ret = _getPackedPath(videoData, 'images', '.jpg');
            break;
        }
        case VideoRole.preview: {
            ret = _getPackedPath(videoData, 'previews', '.mp4');
            break;
        }
    }
    return ret;
}

function _getPackedPath(videoData: VideoResponse, folder: string, suffix: string) {
    return `${folder}/${videoData.label}${suffix}`;
}
function getMtime(videoData: VideoResponse, role: VideoRole): number | null {
    switch (role) {
        case VideoRole.thumb: {
            return videoData.thumb_mtime;
        }
        case VideoRole.poster: {
            return videoData.poster_mtime;
        }
        case VideoRole.preview: {
            return videoData.preview_mtime;
        }
        default:
            console.error('Unkown role: ' + role);
            return null;
    }
}
function getPath(videoData: VideoResponse, role: VideoRole): string | null {
    if (isFileProtocol) {
        return getPackedPath(videoData, role);
    }
    return getPathWithMtime(videoData, role);
}

function getPathWithMtime(videoData: VideoResponse, role: VideoRole): string | null {
    const mtime = getMtime(videoData, role);
    if (!mtime) {
        return null;
    }
    return `/videos/${videoData.uuid}.${role}?timestamp=${mtime}`;
}
const elementHub = new Map<string, HTMLElement>();
export const getters: GetterTree<VideoState, RootState> = {
    getVideoURI(contextState) {
        return (id: string, role: VideoRole) => {
            const data = contextState.storage[id];
            if (!data) {
                return null;
            }
            return getPath(data, role);
        };
    },
    scrollTo() {
        return (id: string) => {
            const element = elementHub.get(id);
            if (element) {
                window.scroll(undefined, element.offsetTop);
            }
        };
    },
    videoElementHub() {
        return elementHub;
    },
    appearedVideos() {
        return () => {
            const ret: string[] = [];
            elementHub.forEach(
                (value, key) => {
                    if (isElementAppread(value)) {
                        ret.push(key);
                    }
                },
            );
            return ret;
        };
    },
};

interface VideoComputedMixin extends DefaultComputed {
    videoStore: () => VideoState;
    scrollTo: () => (id: string) => void;
    getVideoURI: () => (id: string, role: VideoRole) => string | null;
    videoElementHub: () => typeof elementHub;
    appearedVideos: () => () => string[];
}

export const videoComputedMinxin = {
    ...mapState(
        ['videoStore'],
    ),
    ...mapGetters([
        'scrollTo',
        'getVideoURI',
        'videoElementHub',
        'appearedVideos',
    ]),
} as VideoComputedMixin;

function parseDataFromPage(): VideoState['storage'] {
    const app = document.getElementById('app');
    if (!app) {
        console.error('Not found element: #app');
        return {};
    }
    const data = app.dataset.page;
    if (!data) {
        console.error('No data recieved.');
        return {};
    }
    const time = new Date().getTime();
    const parsed = JSON.parse(data) as VideoResponse[];
    const ret: VideoState['storage'] = {};
    parsed.forEach(
        (value) => {
            ret[value.uuid] = value;
        },
    );
    return ret;
}

const state: VideoState = {
    storage: parseDataFromPage(),
    posterStatusMap: {},
};

const mutations: MutationTree<VideoState> = {
    [VIDEO.READ](contextState, payload: VideoReadMutationPayload) {
        Vue.set(contextState.storage, payload.id, payload.data);
    },
    [SET_VIDEO_POSTER_STATUS](contextState, payload: VideoSetPosterStatusMutationPayload) {
        Vue.set(contextState.posterStatusMap, payload.id, payload.status);
    },
};

function isElementAppread(element: HTMLElement): boolean {
    if (!element || element.hidden) {
        return false;
    }
    const top = window.scrollY;
    const bottom = top + window.innerHeight;
    const ypos = element.offsetTop;
    const boxHeight = element.clientHeight;
    const ret = (top <= ypos + boxHeight && ypos <= bottom);
    return ret;
}

const actions: ActionTree<VideoState, RootState> = {
    async [VIDEO.READ](context, payload: VideoReadActionPayload) {
        if (isFileProtocol) {
            return;
        }
        return axios.get(`/api/video/${payload.id}`).then((response) => {
            const data: VideoResponse = response.data;
            const mutationPayload: VideoReadMutationPayload = { id: payload.id, data };
            context.commit(VIDEO.READ, mutationPayload);
            return response;
        });
    },
    [LOAD_VIDEO_POSTER](context, payload: VideoLoadPosterActionPayload) {
        if (context.state.posterStatusMap[payload.id] === LoadStatus.ready) {
            return;
        }
        const uri: string | null = context.getters.getVideoURI(payload.id, VideoRole.poster);
        const mutationPayload: VideoSetPosterStatusMutationPayload = { id: payload.id, status: LoadStatus.notReady };
        context.commit(SET_VIDEO_POSTER_STATUS, mutationPayload);
        if (!uri) {
            return;
        }
        imageAvailable(
            uri,
            () => {
                mutationPayload.status = LoadStatus.ready;
                context.commit(SET_VIDEO_POSTER_STATUS, mutationPayload);
            },
            () => {
                mutationPayload.status = LoadStatus.failed;
                context.commit(SET_VIDEO_POSTER_STATUS, mutationPayload);
            },
        );
    },
};

const module: Module<VideoState, RootState> = {
    state,
    getters,
    mutations,
    actions,
};

export default module;
