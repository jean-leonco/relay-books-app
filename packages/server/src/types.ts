import { SortDirection } from '@entria/graphql-mongo-helpers';
import DataLoader from 'dataloader';
import { GraphQLFieldConfig } from 'graphql';
import { Context } from 'koa';
import { Types } from 'mongoose';
import { ObjectSchema, Shape } from 'yup';

import { t } from './locales/helpers';
import { IBook } from './modules/book/BookModel';
import { ICategory } from './modules/category/CategoryModel';
import { IReading } from './modules/reading/ReadingModel';
import { IReview } from './modules/review/ReviewModel';
import { IToken } from './modules/token/TokenModel';
import { IUser } from './modules/user/UserModel';

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
  user?: IUser;
  appplatform: string;
  koaContext: Context;
  t: typeof t;
}

export interface LoggedGraphQLContext extends GraphQLContext {
  user: IUser;
}

export interface KoaContext {
  dataloaders: GraphQLDataloaders;
  user: IUser | null;
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
