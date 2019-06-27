// Setup sentry
import { USERNAME } from '@/constants';
import { getDataFromAppElement } from '@/datatools';
import * as sentry from '@sentry/browser';
import { Vue as SentryVue } from '@sentry/integrations';
import Vue from 'vue';

const SENTRY_DSN = getDataFromAppElement('sentryDsn');

if (SENTRY_DSN) {
  sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [new SentryVue({ Vue, attachProps: true })],
  });
  sentry.configureScope((scope: sentry.Scope) =>
    scope.setUser({ username: USERNAME })
  );
}
