import { withBrowserCheck } from '@/browser-check';

withBrowserCheck(() => {
  require('./app.static');
});
