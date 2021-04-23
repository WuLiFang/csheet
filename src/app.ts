import App from '@/App.vue';
import { apolloProvider } from '@/plugins/apollo';
import '@/plugins/browser-warning';
import '@/plugins/composition-api';
import { i18n } from '@/plugins/i18n';
import '@/plugins/moment';
import '@/plugins/sentry';
import '@/plugins/vue-awesome';
import '@/styles/index.scss';
import Vue from 'vue';

// Global components
(() => {
  const components = require.context('@/components/global', false, /\.vue$/);
  for (const k of components.keys()) {
    const component = components(k).default;
    // Can not use component.name because it will be minified.
    const match = k.match(/\/(.+).vue$/);
    if (!match) {
      throw new Error(`Invalid global component: ${k}`);
    }
    Vue.component(match[1], component);
  }
})();

export const app = new Vue({
  apolloProvider,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
