import { GraphQLString, GraphQLNonNull, GraphQLFloat, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';
import { errorField, successField } from '@entria/graphql-mongo-helpers';

import { LoggedGraphQLContext, MutationField } from '../../../types';

import ReadingModel from '../../reading/ReadingModel';

import * as BookLoader from '../../book/BookLoader';

import ReviewModel from '../ReviewModel';
import * as ReviewLoader from '../ReviewLoader';
import { ReviewConnection } from '../ReviewType';

import ReviewAddMutationSchema from './validationSchemas/ReviewAddMutationSchema';

interface ReviewAddArgs {
  bookId: string;
  rating: number;
  description?: string;
}

const mutation = mutationWithClientMutationId({
  name: 'ReviewAdd',
  inputFields: {
    bookId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The book rated on this review.',
    },
    rating: {
      type: GraphQLNonNull(GraphQLFloat),
      description: 'The rating of the review. ex: 4.5',
    },
    description: {
      type: GraphQLString,
      description: 'The review description. ex: This book is awesome',
    },
  },
  mutateAndGetPayload: async (args: ReviewAddArgs, context: LoggedGraphQLContext) => {
    const { user, t } = context;
    const { rating, description } = args;

    const book = await BookLoader.load(context, fromGlobalId(args.bookId).id);

    if (!book) {
      return { error: t('book', 'TheBookIdIsInvalid') };
    }

    const prevReview = await ReviewModel.findOne({ userId: user.id, bookId: book.id });

    if (prevReview) {
      return { error: t('review', 'AReviewForThisBookWasAlreadyCreated') };
    }

    const reading = await ReadingModel.findOne({ userId: user.id, bookId: book.id });

    if (!reading || reading.readPages < book.pages) {
      return { error: t('review', 'UnableToReviewBookWithoutFinishingIt') };
    }

    const review = await new ReviewModel({
      userId: user.id,
      bookId: book.id,
      rating,
      description,
    }).save();

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
