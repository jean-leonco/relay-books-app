import AsyncStorage from '@react-native-community/async-storage';
import i18n, { LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';

import { I18N_KEY } from './common/config';

import en from './locales/en';
import pt from './locales/pt';

export const getDeviceLanguage = () => {
  if (Platform.OS === 'android') {
    return NativeModules.I18nManager.localeIdentifier;
  }

  return NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0];
};

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async (callback) => {
    const language = await AsyncStorage.getItem(I18N_KEY);

    if (language) {
      return callback(language);
    }

    const deviceLanguage = getDeviceLanguage();

    return callback(deviceLanguage || 'en');
  },
  cacheUserLanguage: async (language) => {
    await AsyncStorage.setItem(I18N_KEY, language);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, pt },
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt'],
    nonExplicitSupportedLngs: true,
  });

export default i18n;
