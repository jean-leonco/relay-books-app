import { DirectionEnumType } from '@entria/graphql-mongo-helpers';
import { GraphQLEnumType, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import { StatusDateSort, dateFields } from '../../../graphql/filters/StatusDateOrderingInputType';

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
