import DataLoader from 'dataloader';
import { connectionFromMongoAggregate, mongooseLoader } from '@entria/graphql-mongoose-loader';
import { ConnectionArguments } from 'graphql-relay';
import { buildMongoConditionsFromFilters } from '@entria/graphql-mongo-helpers';
import { NullConnection } from '@entria/graphql-mongo-helpers/lib/NullConnection';

import { GraphQLContext, DataLoaderKey, ObjectId } from '../../types';
import { buildAggregatePipeline } from '../../graphql/filters/graphqlFilters';
import { isLoggedViewerCanSee } from '../../security';

import { registerLoader } from '../loader/loaderRegister';

import ReviewModel, { IReview } from './ReviewModel';
import { reviewFilterMapping, ReviewsArgFilters } from './filters/ReviewFiltersInputType';

export default class Review {
  public registeredType = 'Review';

  id: string;
  _id: ObjectId;
  bookId: ObjectId;
  userId: ObjectId;
  rating: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IReview) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.bookId = data.bookId;
    this.userId = data.userId;
    this.rating = data.rating;
    this.description = data.description;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export const getLoader = () => new DataLoader<DataLoaderKey, IReview>((ids) => mongooseLoader(ReviewModel, ids));

registerLoader('ReviewLoader', getLoader);

export const load = async (context: GraphQLContext, id: DataLoaderKey) => {
  if (!id) return null;

  try {
    const data = await context.dataloaders.ReviewLoader.load(id);

    if (!data) return null;

    return isLoggedViewerCanSee(context, data) ? new Review(data) : null;
  } catch (err) {
    return null;
  }
};

export const clearCache = ({ dataloaders }: GraphQLContext, id: string) =>
  dataloaders.ReviewLoader.clear(id.toString());

export const primeCache = ({ dataloaders }: GraphQLContext, id: string, data: IReview) =>
  dataloaders.ReviewLoader?.prime(id.toString(), data);

export const clearAndPrimeCache = (context: GraphQLContext, id: string, data: IReview) =>
  clearCache(context, id) && primeCache(context, id, data);

interface LoadReviewsArgs extends ConnectionArguments {
  filters?: ReviewsArgFilters;
}
export const loadReviews = async (context: GraphQLContext, args: LoadReviewsArgs) => {
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
    reviewFilterMapping,
  );

  const aggregatePipeline = buildAggregatePipeline({ defaultConditions, builtMongoConditions });

  const aggregate = ReviewModel.aggregate(aggregatePipeline);

  return connectionFromMongoAggregate({
    aggregate,
    context,
    args,
    loader: load,
  });
};

export const loadBookAverageRating = async (context: GraphQLContext, bookId: ObjectId) => {
  const { user } = context;

  if (!user) {
    return 0;
  }

  const aggregate = await ReviewModel.aggregate<{ average: number }>([
    { $match: { bookId } },
    {
      $group: {
        _id: null,
        totalRating: { $sum: '$rating' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        average: { $divide: ['$totalRating', '$count'] },
      },
    },
  ]);

  // in this case, there is no review for the provided id
  if (aggregate.length === 0) {
    return 0;
  }

  return aggregate[0].average;
};
