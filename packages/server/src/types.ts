import { GraphQLFieldConfig } from 'graphql';
import DataLoader from 'dataloader';
import { Types } from 'mongoose';
import { Context } from 'koa';
import { SortDirection } from '@entria/graphql-mongo-helpers';
import { ObjectSchema, Shape } from 'yup';

import User from './modules/user/UserLoader';

import { IUser } from './modules/user/UserModel';
import { IToken } from './modules/token/TokenModel';
import { IBook } from './modules/book/BookModel';
import { IReview } from './modules/review/ReviewModel';
import { ICategory } from './modules/category/CategoryModel';
import { IReading } from './modules/reading/ReadingModel';

import { t } from './locales/helpers';

export type ObjectId = Types.ObjectId;

export type DataLoaderKey = ObjectId | string | undefined | null;

export interface GraphQLDataloaders {
  UserLoader: DataLoader<DataLoaderKey, IUser>;
  TokenLoader: DataLoader<DataLoaderKey, IToken>;
  BookLoader: DataLoader<DataLoaderKey, IBook>;
  ReviewLoader: DataLoader<DataLoaderKey, IReview>;
  CategoryLoader: DataLoader<DataLoaderKey, ICategory>;
  ReadingLoader: DataLoader<DataLoaderKey, IReading>;
}

export interface GraphQLContext {
  dataloaders: GraphQLDataloaders;
  user?: User;
  appplatform: string;
  koaContext: Context;
  t: typeof t;
}

export interface LoggedGraphQLContext extends GraphQLContext {
  user: User;
}

export interface KoaContext {
  dataloaders: GraphQLDataloaders;
  user: User | null;
}

export type GraphQLArgFilter<T> = {
  filter?: {
    OR: T[];
    AND: T[];
  };
} & T;

export interface GraphqlSortArg<SortFieldT> {
  field: SortFieldT;
  direction: SortDirection;
}

export interface IStatusSchema {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Extensions {
  validationSchema?(context: GraphQLContext): ObjectSchema<Shape<any, any>>;
  authenticatedOnly?: boolean;
}

export interface MutationField extends GraphQLFieldConfig<any, any, { [argName: string]: any }> {
  extensions?: Extensions | null | undefined;
}
