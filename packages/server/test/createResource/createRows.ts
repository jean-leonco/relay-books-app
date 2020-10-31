import { DeepPartial } from '@booksapp/types';

import {
  ISessionToken,
  IUser,
  SESSION_TOKEN_SCOPES,
  SessionToken,
  User,
  Book,
  IBook,
  Review,
  IReview,
  Category,
  ICategory,
  Reading,
  IReading,
} from '../../src/models';

import { getObjectId, PLATFORM } from '../../src/common/utils';

import { getOrCreate } from './helpers';

export const createUser = async (args: DeepPartial<IUser> = {}): Promise<IUser> => {
  const n = (global.__COUNTERS__.user += 1);
  const { name, email, password, ...rest } = args;

  return new User({
    name: name || `User #${n}`,
    email: email || { email: `user${n}@example.com`, wasVerified: true },
    password: password || '123456789',
    ...rest,
  }).save();
};

export const createSessionToken = async (args: DeepPartial<ISessionToken> = {}) => {
  const { user, ip = '::ffff:127.0.0.1', channel, scope, ...rest } = args;

  return new SessionToken({
    ...(user ? { user: getObjectId(user) } : {}),
    ip,
    channel: channel || PLATFORM.APP,
    scope: scope || SESSION_TOKEN_SCOPES.SESSION,
    ...rest,
  }).save();
};

export const createBook = async (args: DeepPartial<IBook> = {}) => {
  const { name, author, description, pages, bannerUrl, ...rest } = args;

  const n = (global.__COUNTERS__.book += 1);

  return new Book({
    name: name || `name ${n}`,
    author: author || `author ${n}`,
    description: description || `description ${n}`,
    pages: pages || n * 10,
    bannerUrl: bannerUrl || `bannerUrl ${n}`,
    ...rest,
  }).save();
};

export const createReview = async (args: DeepPartial<IReview> = {}) => {
  const { userId, bookId, rating, ...rest } = args;

  const n = (global.__COUNTERS__.review += 1);

  let userObj;
  if (!userId) {
    userObj = await getOrCreate(User, createUser);
  }

  let bookObj;
  if (!bookId) {
    bookObj = await getOrCreate(Book, createBook);
  }

  return new Review({
    userId: getObjectId(userId || userObj),
    bookId: getObjectId(bookId || bookObj),
    rating: rating || n,
    ...rest,
  }).save();
};

export const createCategory = async (args: DeepPartial<ICategory> = {}) => {
  const { name, ...rest } = args;

  const n = (global.__COUNTERS__.category += 1);

  return new Category({
    name: name || `category ${n}`,
    ...rest,
  }).save();
};

export const createReading = async (args: DeepPartial<IReading> = {}) => {
  const { userId, bookId, readPages, ...rest } = args;

  const n = (global.__COUNTERS__.reading += 1);

  let userObj;
  if (!userId) {
    userObj = await getOrCreate(User, createUser);
  }

  let bookObj;
  if (!bookId) {
    bookObj = await getOrCreate(Book, createBook);
  }

  return new Reading({
    userId: getObjectId(userId || userObj),
    bookId: getObjectId(bookId || bookObj),
    readPages: readPages || n,
    ...rest,
  }).save();
};
