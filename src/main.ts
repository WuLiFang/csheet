import { getDataFromAppElement } from '@/datatools';
import { isFileProtocol } from '@/packtools';
import SocketIO from '@/socketio';
import _store from '@/store';
import CSheet from '@/views/CSheet.vue';
// @ts-ignore
import { Icon } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
import Vue from 'vue';
import Vuex from 'vuex';

// Setup sentry
const SENTRY_DSN = getDataFromAppElement('sentryDsn');
if (process.env.NODE_ENV === 'production' && SENTRY_DSN) {
  Raven.config(SENTRY_DSN, {
    release: VERSION,
  })
    .addPlugin(RavenVue, Vue)
    .install();
}

Vue.use(Vuex);
Vue.use(Icon);
moment.locale(navigator.language);

const store = new Vuex.Store(_store);
const vue = new Vue({
  store,
  render: h => h(CSheet),
}).$mount('#app');

if (!isFileProtocol) {
  const IO = new SocketIO(store);
}
