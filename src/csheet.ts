import Vue from 'vue';
import Vuex from 'vuex';

// @ts-ignore
import { Icon } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import moment from 'moment';
import 'moment/locale/zh-cn';

import './csheet.scss?external';

import TheCSheet from './components/TheCSheet.vue';

import SocketIO from './socketio';
import _store from './store';
import { VideoResponse } from '@/interface';
import { VIDEO, VideoReadMutationPayload } from '@/mutation-types';
import { isFileProtocol } from '@/packtools';


Vue.use(Vuex);
Vue.use(Icon);
moment.locale(navigator.language);

const store = new Vuex.Store(_store);
const vue = new Vue({
    store,
    render: (h) => h(TheCSheet),
}).$mount('#app');

if (!isFileProtocol) {
    const IO = new SocketIO(store);
}
