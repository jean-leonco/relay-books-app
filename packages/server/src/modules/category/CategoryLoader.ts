import DataLoader from 'dataloader';
import { connectionFromMongoAggregate, mongooseLoader } from '@entria/graphql-mongoose-loader';
import { ConnectionArguments } from 'graphql-relay';
import { buildMongoConditionsFromFilters } from '@entria/graphql-mongo-helpers';
import { NullConnection } from '@entria/graphql-mongo-helpers/lib/NullConnection';

import { GraphQLContext, DataLoaderKey, ObjectId } from '../../types';
import { buildAggregatePipeline } from '../../graphql/filters/graphqlFilters';
import { isLoggedViewerCanSee } from '../../security';

import { registerLoader } from '../loader/loaderRegister';

import CategoryModel, { ICategory } from './CategoryModel';
import { CategoriesArgFilters, categoryFilterMapping } from './filters/CategoryFiltersInputType';

export default class Category {
  public registeredType = 'Category';

  id: string;
  _id: ObjectId;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ICategory) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.name = data.name;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export const getLoader = () => new DataLoader<DataLoaderKey, ICategory>((ids) => mongooseLoader(CategoryModel, ids));

registerLoader('CategoryLoader', getLoader);

export const load = async (context: GraphQLContext, id: DataLoaderKey) => {
  if (!id) return null;

  try {
    const data = await context.dataloaders.CategoryLoader.load(id);

    if (!data) return null;

    return isLoggedViewerCanSee(context, data) ? new Category(data) : null;
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
