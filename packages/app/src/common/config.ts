import {
  NODE_ENV as NATIVE_NODE_ENV,
  GRAPHQL_URL as NATIVE_GRAPHQL_URL,
  AUTH_KEY as NATIVE_AUTH_KEY,
  I18N_KEY as NATIVE_I18N_KEY,
  // eslint-disable-next-line import/no-unresolved
} from '@env';

export const NODE_ENV = NATIVE_NODE_ENV || 'development';
export const GRAPHQL_URL = NATIVE_GRAPHQL_URL || 'http://localhost:5001/graphql';
export const AUTH_KEY = NATIVE_AUTH_KEY || 'booksapp:auth:token';
export const I18N_KEY = NATIVE_I18N_KEY || 'i18nlang';
