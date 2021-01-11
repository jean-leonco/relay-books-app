import { GraphQLString, GraphQLNonNull, GraphQLFloat, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';
import { errorField, successField } from '@entria/graphql-mongo-helpers';

import { LoggedGraphQLContext, MutationField } from '../../../types';

import ReviewModel from '../ReviewModel';
import * as ReviewLoader from '../ReviewLoader';
import { ReviewConnection } from '../ReviewType';

import ReviewAddMutationSchema from './validationSchemas/ReviewAddMutationSchema';

interface ReviewEditArgs {
  id: string;
  rating?: number;
  description?: string;
}

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

    const review = await ReviewModel.findOneAndUpdate(
      { _id: fromGlobalId(id).id, userId: user.id, isActive: true },
      newData,
    );

    if (!review) {
      return { error: t('review', 'ReviewNotFound') };
    }

    ReviewLoader.clearCache(context, review._id);

    return {
      id: review._id,
      error: null,
    };
  },
  outputFields: {
    reviewEdge: {
      type: ReviewConnection.edgeType,
      resolve: async ({ id }, _args, context) => {
        const review = await ReviewLoader.load(context, id);

        if (!review) {
          return null;
        }

        return {
          cursor: toGlobalId('Review', review.id),
          node: review,
        };
      },
    },
    ...successField,
    ...errorField,
  },
});

const mutationField: MutationField = {
  extensions: {
    authenticatedOnly: true,
    validationSchema: ReviewAddMutationSchema,
  },
  ...mutation,
};

export default mutationField;
