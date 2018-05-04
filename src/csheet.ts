import Vue from 'vue';

import SocketIO from './socketio';

import './csheet.scss?external';
import './socketio';
import TheCSheet from './components/TheCSheet.vue';
import { CSheetVideoDataRow } from './types';
import { CSheetVideo, VideoStorage } from './video';


export let VideoBus = parseData()
const vue = new Vue({
    template: '<TheCSheet :videos="videos"/>',
    data() {
        return {
            videos: VideoBus
        }
    },
    components: {
        TheCSheet
    }
})

function parseData(): VideoStorage {
    let app = document.getElementById('app')
    if (!app) {
        console.error('Not found element: #app')
        return {}
    }
    let data = app.dataset['page']
    if (!data) {
        console.error('No data recieved.')
        return {}
    }
    let parsed = <Array<CSheetVideoDataRow>>JSON.parse(data)
    let ret: VideoStorage = {}
    parsed.forEach(
        value => {
            ret[value[0]] = CSheetVideo.fromDataRow(value)
        }
    )

    return ret
}

vue.$mount('#app')
const IO = new SocketIO(VideoBus)