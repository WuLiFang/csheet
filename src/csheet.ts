import Vue from 'vue';

import SocketIO from './socketio';
// @ts-ignore
import { Icon } from 'element-ui';
import './socketio';
import './csheet.scss?external';
import 'element-ui/lib/theme-chalk/index.css';

import TheCSheet from './components/TheCSheet.vue';
import { CSheetVideoDataRow } from './types';
import { CSheetVideo, VideoStorage } from './video';
import * as moment from 'moment';
import 'moment/locale/zh-cn';

Vue.use(Icon)
moment.locale(navigator.language)

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