import { DirectionEnumType } from '@entria/graphql-mongo-helpers';
import { GraphQLInputObjectType, GraphQLNonNull, GraphQLEnumType } from 'graphql';

import { dateFields, StatusDateSort } from '../../../core/graphql/graphqlFilters/StatusDateOrderingInputType';

import { GraphqlSortArg } from '../../../types';

type ReviewSort = 'rating' | StatusDateSort;

type ReviewOrdering = GraphqlSortArg<ReviewSort>;

const ReviewSortEnumType = new GraphQLEnumType({
  name: 'ReviewSortEnumType',
  values: {
    RATING: {
      value: 'rating',
      description: 'The rating of the review. ex: 4.5',
    },
    ...dateFields,
  },
});

const ReviewOrderingInputType = new GraphQLInputObjectType({
  name: 'ReviewOrdering',
  description: 'Used to order reviews.',
  fields: () => ({
    sort: {
      type: new GraphQLNonNull(ReviewSortEnumType),
      description: 'the field used to sort. Ex: CREATED_AT.',
    },
    direction: {
      type: new GraphQLNonNull(DirectionEnumType),
      description: 'the direction used to sort. Ex: ASC.',
    },
  }),
});

export { ReviewSort, ReviewOrdering, ReviewSortEnumType, ReviewOrderingInputType };
