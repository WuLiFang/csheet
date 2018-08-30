import { getDataFromAppElement } from '@/datatools';
import { Loading } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';
import TheIndex from './components/TheIndex.vue';

Vue.use(Loading);
const vue = new Vue({
  render: h => h(TheIndex),
});
interface Project {
  code: string;
  name: string;
}

export const projects = JSON.parse(
  getDataFromAppElement('projects'),
) as Project[];
export const version = JSON.parse(getDataFromAppElement('version')) as string;

export function showFullScreenLoading() {
  return Loading.service(
    {
      fullscreen: true,
      text: '正在生成',
      background: 'rgba(0, 0, 0, 0.8)',
    },
  );
}
vue.$mount('#app');
