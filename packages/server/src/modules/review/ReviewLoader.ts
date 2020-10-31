import DataLoader from 'dataloader';
import { connectionFromMongoAggregate, mongooseLoader } from '@entria/graphql-mongoose-loader';
import { ConnectionArguments } from 'graphql-relay';
import { Types } from 'mongoose';
import { buildMongoConditionsFromFilters } from '@entria/graphql-mongo-helpers';

import { GraphQLContext, DataLoaderKey } from '../../types';

import { NullConnection } from '../../graphql/connection/NullConnection';
import { buildAggregatePipeline } from '../../core/graphql/graphqlFilters/graphqlFilters';

import ReviewModel, { IReview } from './ReviewModel';
import { reviewFilterMapping, ReviewsArgFilters } from './filters/ReviewFiltersInputType';

export default class Review {
  public registeredType = 'Review';

  id: string;
  _id: Types.ObjectId;
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  description?: string;
  isActive: boolean;
  removedAt: Date | null;
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
    this.removedAt = data.removedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export const getLoader = () => new DataLoader((ids) => mongooseLoader(ReviewModel, ids));

const viewerCanSee = (context: GraphQLContext, data: IReview) => {
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
    const data = await context.dataloaders.ReviewLoader.load(id);

    if (!data) return null;

    return viewerCanSee(context, data) ? new Review(data) : null;
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

export const loadBookAverageRating = async (context: GraphQLContext, bookId: Types.ObjectId) => {
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
