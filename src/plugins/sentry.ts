import * as client from '@/client';
import * as sentry from '@sentry/browser';
import { Vue as SentryVue } from '@sentry/integrations';
import Vue from 'vue';

(async () => {
  const config = await client.config.get();
  if (!config?.sentryDSN) {
    return;
  }
  // https://github.com/getsentry/sentry-javascript/issues/3388
  const isAffectedByIssue3388 = navigator.userAgent.includes('Chrome/74.0.3729');
  sentry.init({
    environment: process.env.NODE_ENV,
    dsn: config.sentryDSN,
    release: RELEASE,
    defaultIntegrations: false,
    integrations: [
      new sentry.Integrations.InboundFilters(),
      new sentry.Integrations.FunctionToString(),
      new sentry.Integrations.TryCatch({
        requestAnimationFrame: !isAffectedByIssue3388,
        eventTarget: !isAffectedByIssue3388,
      }),
      new sentry.Integrations.Breadcrumbs(),
      new sentry.Integrations.GlobalHandlers(),
      new sentry.Integrations.LinkedErrors(),
      new sentry.Integrations.UserAgent(),
      new SentryVue({ Vue, attachProps: true }),
    ],
  });
})();
