import { StringMap, TOptions } from 'i18next';
import { useCallback } from 'react';
import { useTranslation as reactUseTranslation } from 'react-i18next';

import { I18nTranslation } from './en';

type AcceptedKeys = keyof I18nTranslation['translation'];

const useTranslation = () => {
  const { t, ...i18n } = reactUseTranslation();

  const translation = useCallback((key: AcceptedKeys, options?: TOptions<StringMap> | string) => t(key, options), [t]);

  return { t: translation, ...i18n };
};

export default useTranslation;
