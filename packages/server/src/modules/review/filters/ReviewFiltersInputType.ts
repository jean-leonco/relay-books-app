import { FILTER_CONDITION_TYPE, buildSortFromArg, getObjectId } from '@entria/graphql-mongo-helpers';
import { FilterMapping } from '@entria/graphql-mongo-helpers/lib/types';
import { GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { GraphQLArgFilter, ObjectId } from '../../../types';

import { ReviewOrdering, ReviewOrderingInputType } from './ReviewOrderingInputType';

export type ReviewsArgFilters = GraphQLArgFilter<{
  orderBy?: ReviewOrdering[];
  book?: ObjectId;
  user?: ObjectId;
}>;

export const reviewFilterMapping: FilterMapping = {
  book: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    key: 'bookId',
    format: (book: string) => getObjectId(book),
  },
  user: {
    type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
    key: 'userId',
    format: (user: string) => getObjectId(user),
  },
  orderBy: {
    type: FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
    pipeline: (value: ReviewOrdering[]) => [{ $sort: buildSortFromArg(value) }],
  },
};

const ReviewFiltersInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'ReviewFilters',
  description: 'Used to filter reviews',
  fields: () => ({
    OR: {
      type: GraphQLList(ReviewFiltersInputType),
    },
    AND: {
      type: GraphQLList(ReviewFiltersInputType),
    },
    orderBy: {
      type: GraphQLList(GraphQLNonNull(ReviewOrderingInputType)),
      description: 'Order reviews by ReviewOrderingInputType.',
    },
    book: {
      type: GraphQLID,
      description: 'Filter by book.',
    },
    user: {
      type: GraphQLID,
      description: 'Filter by user.',
    },
  }),
});

export default ReviewFiltersInputType;
