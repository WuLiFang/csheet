import { getDataFromAppElement } from '@/datatools';
import { Loading } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';
import Vuex from 'vuex';
import TheIndex from './components/TheIndex.vue';
Vue.use(Vuex);
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
vue.$mount('#app');
// $(document).ready(() => {
//   $('#inputProject').change(function(this: any) {
//     $.get(
//       '/api/project_code/' +
//         $(this)
//           .children(':selected')
//           .text(),
//       (result: any) => {
//         $('#inputPrefix').val(result + '_EP01_');
//         const inputPrefix = $('#inputPrefix')[0] as HTMLInputElement;
//         inputPrefix.focus();
//         inputPrefix.setSelectionRange(result.length + 3, result.length + 5);
//       },
//     );
//   });
//   const button = $('#open') as JQuery<HTMLButtonElement>;
//   $('form').submit(() => {
//     button.each(function() {
//       this.disabled = true;
//     });
//     let count = 0;
//     function updateText() {
//       const dotAmount = ((count + 2) % 3) + 1;
//       let message = '正在生成';
//       for (let i = 0; i < dotAmount; i++) {
//         message += '.';
//       }
//       button.html(message);
//       count += 1;
//     }
//     updateText();
//     setInterval(updateText, 500);
//   });
// });
