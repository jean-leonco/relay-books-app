import { GraphQLNonNull, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';
import { errorField, successField } from '@entria/graphql-mongo-helpers';

import { LoggedGraphQLContext, MutationField } from '../../../types';

import * as BookLoader from '../../book/BookLoader';

import ReadingModel from '../ReadingModel';
import * as ReadingLoader from '../ReadingLoader';
import { ReadingConnection } from '../ReadingType';

interface ReadingAddArgs {
  bookId: string;
}

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
      resolve: async ({ id }, _args, context) => {
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
    ...successField,
    ...errorField,
  },
});

const mutationField: MutationField = {
  extensions: {
    authenticatedOnly: true,
  },
  ...mutation,
};

export default mutationField;
