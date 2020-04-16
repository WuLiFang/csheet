// import * as client from '@/client';
// import * as sentry from '@sentry/browser';
// import { Vue as SentryVue } from '@sentry/integrations';
// import Vue from 'vue';

// (async () => {
//   const serverInfoData = await client.getServerInfo();
//   if (!(serverInfoData && serverInfoData.sentryDsn)) {
//     return;
//   }
//   sentry.init({
//     environment: process.env.NODE_ENV,
//     dsn: serverInfoData.sentryDsn,
//     integrations: [new SentryVue({ Vue, attachProps: true })],
//   });
// })();
