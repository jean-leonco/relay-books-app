import { GraphQLNonNull, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import ReadingModel from '../ReadingModel';

import * as ReadingLoader from '../ReadingLoader';
import { ReadingConnection } from '../ReadingType';

import errorField from '../../../core/graphql/errorField';
import { LoggedGraphQLContext } from '../../../types';

import { BookLoader } from '../../../loader';

type ReadingAddArgs = {
  bookId: string;
};

const mutation = mutationWithClientMutationId({
  name: 'ReadingAdd',
  inputFields: {
    bookId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The book being read global id.',
    },
  },
  mutateAndGetPayload: async (args: ReadingAddArgs, context: LoggedGraphQLContext) => {
    const { user, t } = context;
    const { bookId } = args;

    const book = await BookLoader.load(context, fromGlobalId(bookId).id);

    if (!book) {
      return { error: t('book', 'TheBookIdIsInvalid') };
    }

    const reading = await new ReadingModel({
      userId: user._id,
      bookId: book?._id,
      readPages: 1,
    }).save();

    return {
      id: reading._id,
      error: null,
    };
  },
  outputFields: {
    readingEdge: {
      type: ReadingConnection.edgeType,
      resolve: async ({ id }, args, context) => {
        const reading = await ReadingLoader.load(context, id);

        if (!reading) {
          return null;
        }

        return {
          cursor: toGlobalId('Reading', reading._id),
          node: reading,
        };
      },
    },
    ...errorField,
  },
});

export default {
  authenticatedOnly: true,
  ...mutation,
};
