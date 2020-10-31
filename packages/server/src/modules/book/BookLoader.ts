import DataLoader from 'dataloader';
import { connectionFromMongoAggregate, mongooseLoader } from '@entria/graphql-mongoose-loader';
import { ConnectionArguments } from 'graphql-relay';
import { Types } from 'mongoose';
import { buildMongoConditionsFromFilters } from '@entria/graphql-mongo-helpers';

import { GraphQLContext, DataLoaderKey } from '../../types';

import { NullConnection } from '../../graphql/connection/NullConnection';

import { buildAggregatePipeline } from '../../core/graphql/graphqlFilters/graphqlFilters';

import BookModel, { IBook } from './BookModel';
import { BooksArgFilters, bookFilterMapping } from './filters/BookFiltersInputType';

export default class Book {
  public registeredType = 'Book';

  id: string;
  _id: Types.ObjectId;
  name: string;
  author: string;
  description: string;
  releaseYear: number;
  pages: number;
  bannerUrl: string;
  ISBN?: number;
  language?: string;
  categoryId: Types.ObjectId;
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IBook) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.name = data.name;
    this.author = data.author;
    this.description = data.description;
    this.releaseYear = data.releaseYear;
    this.pages = data.pages;
    this.bannerUrl = data.bannerUrl;
    this.ISBN = data.ISBN;
    this.language = data.language;
    this.categoryId = data.categoryId;
    this.isActive = data.isActive;
    this.removedAt = data.removedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export const getLoader = () => new DataLoader((ids) => mongooseLoader(BookModel, ids));

const viewerCanSee = (context: GraphQLContext, data: IBook) => {
  if (!context.user) {
    return false;
  }

  if (!data.isActive || data.removedAt) {
    return false;
  }

  return true;
};

export const load = async (context: GraphQLContext, id: DataLoaderKey) => {
  if (!id) return null;

  try {
    const data = await context.dataloaders.BookLoader.load(id);

    if (!data) return null;

    return viewerCanSee(context, data) ? new Book(data) : null;
  } catch (err) {
    return null;
  }
};

export const clearCache = ({ dataloaders }: GraphQLContext, id: string) => dataloaders.BookLoader.clear(id.toString());

export const primeCache = ({ dataloaders }: GraphQLContext, id: string, data: IBook) =>
  dataloaders.BookLoader?.prime(id.toString(), data);

export const clearAndPrimeCache = (context: GraphQLContext, id: string, data: IBook) =>
  clearCache(context, id) && primeCache(context, id, data);

interface IloadBooksArgs extends ConnectionArguments {
  filters?: BooksArgFilters;
}
export const loadBooks = async (context: GraphQLContext, args: IloadBooksArgs) => {
  const { user } = context;
  const { filters = {} } = args;

  if (!user) {
    return NullConnection;
  }

  const defaultFilters = filters.trending ? {} : { orderBy: [{ field: 'createdAt', direction: -1 }] };
  const defaultConditions = { isActive: true, removedAt: null };

  const builtMongoConditions = buildMongoConditionsFromFilters(
    context,
    { ...defaultFilters, ...filters },
    bookFilterMapping,
  );

  const aggregatePipeline = buildAggregatePipeline({ defaultConditions, builtMongoConditions });

  const aggregate = BookModel.aggregate(aggregatePipeline);

  return connectionFromMongoAggregate({
    aggregate,
    context,
    args,
    loader: load,
  });
};
