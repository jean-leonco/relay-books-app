import { GraphQLString, GraphQLNonNull, GraphQLFloat, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import ReviewModel from '../ReviewModel';

import * as ReviewLoader from '../ReviewLoader';
import { ReviewConnection } from '../ReviewType';

import errorField from '../../../core/graphql/errorField';
import { LoggedGraphQLContext } from '../../../types';

import ReviewAddMutationSchema from './validationSchemas/ReviewAddMutationSchema';

type ReviewEditArgs = {
  id: string;
  rating?: number;
  description?: string;
};

const mutation = mutationWithClientMutationId({
  name: 'ReviewEdit',
  inputFields: {
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The global review id.',
    },
    rating: {
      type: GraphQLFloat,
      description: 'The rating of the review. ex: 4.5',
    },
    description: {
      type: GraphQLString,
      description: 'The review description. ex: This book is awesome',
    },
  },
  mutateAndGetPayload: async (args: ReviewEditArgs, context: LoggedGraphQLContext) => {
    const { user, t } = context;
    const { id, rating, description } = args;

    const newData = {
      ...(rating ? { rating } : {}),
      ...(description ? { description } : {}),
    };

    const review = await ReviewModel.findOneAndUpdate({ _id: fromGlobalId(id).id, userId: user._id }, newData);

    if (!review) {
      return { error: t('review', 'ReviewNotFound') };
    }

    ReviewLoader.clearAndPrimeCache(context, review._id, review);

    return {
      id: review._id,
      error: null,
    };
  },
  outputFields: {
    reviewEdge: {
      type: ReviewConnection.edgeType,
      resolve: async ({ id }, args, context) => {
        const review = await ReviewLoader.load(context, id);

        if (!review) {
          return null;
        }

        return {
          cursor: toGlobalId('Review', review._id),
          node: review,
        };
      },
    },
    ...errorField,
  },
});

export default {
  authenticatedOnly: true,
  validationSchema: ReviewAddMutationSchema,
  ...mutation,
};
