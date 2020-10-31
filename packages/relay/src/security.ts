import AsyncStorage from '@react-native-community/async-storage';

import { AUTH_TOKEN } from './config';

export async function getToken() {
  return AsyncStorage.getItem(AUTH_TOKEN);
}

export async function clearToken() {
  return AsyncStorage.removeItem(AUTH_TOKEN);
}
