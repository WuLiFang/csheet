import Vue from 'vue';
import VueI18n, { LocaleMessages } from 'vue-i18n';

Vue.use(VueI18n);

const locales = require.context('@/locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);

const messages: LocaleMessages = Object.fromEntries(
  locales.keys().map(i => {
    const match = i.match(/([\w_-]+)\./);
    return [(match && match[1]) || i, locales(i)];
  })
);

export const supportedLanguages = Object.keys(messages);

export const locale = ((): string => {
  if (supportedLanguages.includes(navigator.language)) {
    return navigator.language;
  }
  if (navigator.languages) {
    const ret = navigator.languages.find((i): boolean =>
      supportedLanguages.includes(i)
    );
    if (ret) {
      return ret;
    }
  }
  return process.env.VUE_APP_I18N_LOCALE || 'zh';
})();

export const i18n: VueI18n = new VueI18n({
  fallbackLocale: 'zh',
  messages,
  locale,
});
