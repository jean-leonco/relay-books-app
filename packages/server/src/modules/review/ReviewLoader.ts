import { createLoader } from '@entria/graphql-mongo-helpers';
import { ObjectId } from 'mongoose';

import { GraphQLContext } from '../../types';
import { isLoggedAndDataIsActiveViewerCanSee } from '../../security';

import { registerLoader } from '../loader/loaderRegister';

import ReviewModel from './ReviewModel';
import { reviewFilterMapping } from './filters/ReviewFiltersInputType';

const { Wrapper: Review, getLoader, clearCache, load, loadAll } = createLoader({
  model: ReviewModel,
  loaderName: 'ReviewLoader',
  isAggregate: true,
  filterMapping: reviewFilterMapping,
  viewerCanSee: isLoggedAndDataIsActiveViewerCanSee as any,
  shouldValidateContextUser: true,
  defaultConditions: { isActive: true },
  defaultFilters: { orderBy: [{ field: 'createdAt', direction: -1 }] },
});

registerLoader('ReviewLoader', getLoader);

export const loadBookAverageRating = async (context: GraphQLContext, bookId: ObjectId) => {
  const { user } = context;

  if (!user) {
    return 0;
  }

  const aggregate = await ReviewModel.aggregate<{ average: number }>([
    { $match: { bookId, isActive: true } },
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

export { getLoader, clearCache, load, loadAll };

export default Review;
