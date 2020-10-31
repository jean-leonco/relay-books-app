import { GraphQLString, GraphQLNonNull, GraphQLFloat, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import ReviewModel from '../ReviewModel';

import * as ReviewLoader from '../ReviewLoader';
import { ReviewConnection } from '../ReviewType';

import errorField from '../../../core/graphql/errorField';
import { LoggedGraphQLContext } from '../../../types';

import { BookLoader } from '../../../loader';

import ReadingModel from '../../reading/ReadingModel';

import ReviewAddMutationSchema from './validationSchemas/ReviewAddMutationSchema';

type ReviewAddArgs = {
  bookId: string;
  rating: number;
  description?: string;
};

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

    const prevReview = await ReviewModel.findOne({ userId: user._id, bookId: book._id });

    if (prevReview) {
      return { error: t('review', 'AReviewForThisBookWasAlreadyCreated') };
    }

    const reading = await ReadingModel.findOne({ userId: user._id, bookId: book._id });

    if (!reading || reading.readPages < book.pages) {
      return { error: t('review', 'UnableToReviewBookWithoutFinishingIt') };
    }

    const review = await new ReviewModel({
      userId: user._id,
      bookId: book?._id,
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

// @TODO - add type with possible options to the mutation
export default {
  authenticatedOnly: true,
  validationSchema: ReviewAddMutationSchema,
  ...mutation,
};
