import i18next, { TOptions } from 'i18next';

import { NamespaceKeys, MessageKeys } from './en';

export const t = (namespace: NamespaceKeys, message: MessageKeys, options?: TOptions) =>
  i18next.t(`${namespace}::${message}`, options);
