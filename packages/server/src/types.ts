import DataLoader from 'dataloader';
import { Types } from 'mongoose';
import { Context } from 'koa';
import { SortDirection } from '@entria/graphql-mongo-helpers';

import { IUser, ISessionToken, IBook, IReview, ICategory, IReading } from './models';

import { User } from './loader';

import { t } from './locales/helpers';

export type ObjectId = Types.ObjectId;

export type DataLoaderKey = Types.ObjectId | string | undefined | null;

export interface GraphQLDataloaders {
  UserLoader: DataLoader<DataLoaderKey, IUser>;
  SessionTokenLoader: DataLoader<DataLoaderKey, ISessionToken>;
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
  timezone?: string;
}

export interface LoggedGraphQLContext {
  dataloaders: GraphQLDataloaders;
  user: User;
  appplatform: string;
  koaContext: Context;
  t: typeof t;
  timezone: string;
}

export interface KoaContextExt {
  dataloaders: GraphQLDataloaders;
  user: User | null;
}

export type GraphQLArgFilter<T> = {
  filter?: {
    OR: T[];
    AND: T[];
  };
} & T;

export type GraphqlSortArg<SortFieldT> = {
  field: SortFieldT;
  direction: SortDirection;
};
