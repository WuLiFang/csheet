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
interface Project {
  code: string;
  name: string;
}

export const projects: Project[] = JSON.parse(
  getDataFromAppElement('projects')
);

export function showFullScreenLoading() {
  return Loading.service({
    fullscreen: true,
    text: '正在生成',
    background: 'rgba(0, 0, 0, 0.8)',
  });
}
vue.$mount('#app');
