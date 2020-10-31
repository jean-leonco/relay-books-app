import common, { Keys as CommonKeys } from './common';
import auth, { Keys as AuthKeys } from './auth';
import book, { Keys as BookKeys } from './book';
import review, { Keys as ReviewKeys } from './review';

const namespaces = {
  common,
  auth,
  book,
  review,
};

export default namespaces;

export type NamespaceKeys = keyof typeof namespaces;

export type MessageKeys = CommonKeys | AuthKeys | BookKeys | ReviewKeys;
