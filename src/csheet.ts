import * as $ from 'jquery';
import './csheet.scss';
import { LightboxManager } from './lightbox';
import './socketio';
import SocketIO from './socketio';
import Vue from 'vue';
import CSheetComponent from './components/csheet.vue'
import { VideoStorage, CSheetVideo } from './video';
import { CSheetVideoDataRow } from './types';

export let VideoBus = parseData()
const vue = new Vue({
    template: '<c-sheet-component :videos="videos"/>',
    data() {
        return {
            videos: VideoBus
        }
    },
    components: {
        CSheetComponent
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