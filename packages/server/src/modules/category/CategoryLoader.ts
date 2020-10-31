import DataLoader from 'dataloader';
import { connectionFromMongoAggregate, mongooseLoader } from '@entria/graphql-mongoose-loader';
import { ConnectionArguments } from 'graphql-relay';
import { Types } from 'mongoose';
import { buildMongoConditionsFromFilters } from '@entria/graphql-mongo-helpers';

import { GraphQLContext, DataLoaderKey } from '../../types';
import { NullConnection } from '../../graphql/connection/NullConnection';

import { buildAggregatePipeline } from '../../core/graphql/graphqlFilters/graphqlFilters';

import CategoryModel, { ICategory } from './CategoryModel';
import { CategoriesArgFilters, categoryFilterMapping } from './filters/CategoryFiltersInputType';

export default class Category {
  public registeredType = 'Category';

  id: string;
  _id: Types.ObjectId;
  name: string;
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ICategory) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.name = data.name;
    this.isActive = data.isActive;
    this.removedAt = data.removedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export const getLoader = () => new DataLoader((ids) => mongooseLoader(CategoryModel, ids));

const viewerCanSee = (context: GraphQLContext, data: ICategory) => {
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
    const data = await context.dataloaders.CategoryLoader.load(id);

    if (!data) return null;

    return viewerCanSee(context, data) ? new Category(data) : null;
  } catch (err) {
    return null;
  }
};

export const clearCache = ({ dataloaders }: GraphQLContext, id: string) =>
  dataloaders.CategoryLoader.clear(id.toString());

export const primeCache = ({ dataloaders }: GraphQLContext, id: string, data: ICategory) =>
  dataloaders.CategoryLoader?.prime(id.toString(), data);

export const clearAndPrimeCache = (context: GraphQLContext, id: string, data: ICategory) =>
  clearCache(context, id) && primeCache(context, id, data);

interface LoadCategoriesArgs extends ConnectionArguments {
  filters?: CategoriesArgFilters;
}
export const loadCategories = async (context: GraphQLContext, args: LoadCategoriesArgs) => {
  const { user } = context;

  if (!user) {
    return NullConnection;
  }

  const { filters = {} } = args;

  const defaultFilters = { orderBy: [{ field: 'createdAt', direction: -1 }] };
  const defaultConditions = { isActive: true, removedAt: null };

  const builtMongoConditions = buildMongoConditionsFromFilters(
    context,
    { ...defaultFilters, ...filters },
    categoryFilterMapping,
  );

  const aggregatePipeline = buildAggregatePipeline({ defaultConditions, builtMongoConditions });

  const aggregate = CategoryModel.aggregate(aggregatePipeline);

  return connectionFromMongoAggregate({
    aggregate,
    context,
    args,
    loader: load,
  });
};
