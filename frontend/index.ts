import { getDataFromAppElement } from '@/datatools';
import '@/sentry';
import Index from '@/views/Index.vue';
import { Loading } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';

Vue.use(Loading);
const vue = new Vue({
  render: h => h(Index),
});
interface IProject {
  code: string;
  name: string;
}

export const projects: IProject[] = JSON.parse(
  getDataFromAppElement('projects')
);

export function showFullScreenLoading() {
  return Loading.service({
    background: 'rgba(0, 0, 0, 0.8)',
    fullscreen: true,
    text: '正在生成',
  });
}
vue.$mount('#app');
