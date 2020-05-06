import * as client from '@/client';
import * as sentry from '@sentry/browser';
import { Vue as SentryVue } from '@sentry/integrations';
import Vue from 'vue';

(async () => {
  const config = await client.config.get();
  if (!config?.sentryDSN) {
    return;
  }
  sentry.init({
    environment: process.env.NODE_ENV,
    dsn: config.sentryDSN,
    integrations: [new SentryVue({ Vue, attachProps: true })],
  });
})();
