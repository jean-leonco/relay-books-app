import AsyncStorage from '@react-native-community/async-storage';

import { AUTH_KEY, I18N_KEY } from './config';

export const getToken = async () => {
  return AsyncStorage.getItem(AUTH_KEY);
};

export const clearToken = async () => {
  return AsyncStorage.removeItem(AUTH_KEY);
};

export const getLanguage = async () => {
  return AsyncStorage.getItem(I18N_KEY);
};
