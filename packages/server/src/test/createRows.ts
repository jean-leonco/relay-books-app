import { getObjectId } from '@entria/graphql-mongo-helpers';

import { getCounter, getOrCreate } from '@workspace/test-utils';

import BookModel, { IBook } from '../modules/book/BookModel';
import CategoryModel, { ICategory } from '../modules/category/CategoryModel';
import ReadingModel, { IReading } from '../modules/reading/ReadingModel';
import ReviewModel, { IReview } from '../modules/review/ReviewModel';
import TokenModel, { IToken, TOKEN_SCOPES } from '../modules/token/TokenModel';
import UserModel, { IUser } from '../modules/user/UserModel';

export const createUser = async (args: Partial<IUser> = {}) => {
  const { name, email, password, ...rest } = args;

  const i = getCounter('user');

  return new UserModel({
    name: name || `User #${i}`,
    email: email || { email: `user${i}@example.com`, wasVerified: true },
    password: password || '123456789',
    ...rest,
  }).save();
};

export const createToken = async (args: Partial<IToken> = {}) => {
  const { userId, ip, scope, ...rest } = args;

  return new TokenModel({
    ...(userId ? { userId: getObjectId(userId) } : {}),
    ip: ip || '::ffff:127.0.0.1',
    scope: scope || TOKEN_SCOPES.SESSION,
    ...rest,
  }).save();
};

export const createBook = async (args: Partial<IBook> = {}) => {
  const { name, author, description, pages, bannerUrl, ...rest } = args;

  const i = getCounter('book');

  return new BookModel({
    name: name || `name ${i}`,
    author: author || `author ${i}`,
    description: description || `description ${i}`,
    pages: pages ? pages : i || 1 * 10,
    bannerUrl: bannerUrl || `bannerUrl ${i}`,
    ...rest,
  }).save();
};

export const createReview = async (args: Partial<IReview> = {}) => {
  const { userId, bookId, rating, ...rest } = args;

  const i = getCounter('review');

  let userObj: IUser | null = null;
  if (!userId) {
    userObj = await getOrCreate(UserModel, createUser);
  }

  let bookObj: IBook | null = null;
  if (!bookId) {
    bookObj = await getOrCreate(BookModel, createBook);
  }

  return new ReviewModel({
    userId: getObjectId(userId || userObj?._id),
    bookId: getObjectId(bookId || bookObj?._id),
    rating: rating ? rating : i || 1,
    ...rest,
  }).save();
};

export const createCategory = async (args: Partial<ICategory> = {}) => {
  const { key, translation, ...rest } = args;

  const i = getCounter('category');

  return new CategoryModel({
    key: key || `category_${i}`,
    translation: translation || { en: `category ${i}` },
    ...rest,
  }).save();
};

export const createReading = async (args: Partial<IReading> = {}) => {
  const { userId, bookId, readPages, ...rest } = args;

  const i = getCounter('reading');

  let userObj: IUser | null = null;
  if (!userId) {
    userObj = await getOrCreate(UserModel, createUser);
  }

  let bookObj: IBook | null = null;
  if (!bookId) {
    bookObj = await getOrCreate(BookModel, createBook);
  }

  return new ReadingModel({
    userId: getObjectId(userId || userObj?._id),
    bookId: getObjectId(bookId || bookObj?._id),
    readPages: readPages ? readPages : i || 1,
    ...rest,
  }).save();
};
