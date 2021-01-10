import i18next from 'i18next';
import { Middleware } from 'koa';

import pt from './locales/pt';
import en from './locales/en';

i18next.init({
  resources: {
    en,
    pt,
  },
  preload: ['en', 'pt'],
  fallbackLng: 'en',
  nsSeparator: '::',
  whitelist: ['en', 'pt'],
  nonExplicitWhitelist: true,
});

export const i18nMiddleware: Middleware = async (context, next) => {
  const { lang } = context.header;

  if (lang) {
    await i18next.changeLanguage(lang);
  }

  return next();
};

export default i18next;
