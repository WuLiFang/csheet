// Setup sentry
import { getDataFromAppElement } from '@/datatools';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
import Vue from 'vue';

const SENTRY_DSN = getDataFromAppElement('sentryDsn');
if (process.env.NODE_ENV === 'production' && SENTRY_DSN) {
  Raven.config(SENTRY_DSN, {
    release: VERSION,
  })
    .addPlugin(RavenVue, Vue)
    .install();
}
