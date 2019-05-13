import { isFileProtocol } from '@/packtools';
import '@/sentry';
import { SocketIO } from '@/socketio';
import { store as _store } from '@/store';
import MainVue from '@/views/Main.vue';
// @ts-ignore
import { Icon } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
Vue.use(Icon);
moment.locale(navigator.language);

const store = new Vuex.Store(_store);
new Vue({
  store,
  render: h => h(MainVue),
}).$mount('#app');

if (!isFileProtocol) {
  new SocketIO(store);
}
