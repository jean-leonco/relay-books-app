import { GraphQLNonNull, GraphQLID, GraphQLInt } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';
import { errorField, successField } from '@entria/graphql-mongo-helpers';

import { LoggedGraphQLContext, MutationField } from '../../../types';

import * as BookLoader from '../../book/BookLoader';

import ReadingModel from '../ReadingModel';
import * as ReadingLoader from '../ReadingLoader';
import { ReadingConnection } from '../ReadingType';

interface ReadingEditPageArgs {
  id: string;
  currentPage: number;
}

const mutation = mutationWithClientMutationId({
  name: 'ReadingEditPage',
  inputFields: {
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The global Reading id.',
    },
    currentPage: {
      type: GraphQLInt,
      description: 'The current user page. ex: 2',
    },
  },
  mutateAndGetPayload: async (args: ReadingEditPageArgs, context: LoggedGraphQLContext) => {
    const { user, t } = context;
    const { id, currentPage } = args;

    const reading = await ReadingModel.findOne({ _id: fromGlobalId(id).id, userId: user.id });

    if (!reading) {
      return { error: t('book', 'BookNotFound') };
    }

    const book = await BookLoader.load(context, reading.bookId);

    if (!book) {
      return { error: t('book', 'BookNotFound') };
    }

    if (currentPage > book.pages) {
      return { error: t('book', 'CurrentPageShouldNotBeLargerThan') };
    }

    const updatedReading = await ReadingModel.findOneAndUpdate(
      { _id: fromGlobalId(id).id, userId: user.id },
      { readPages: currentPage || 1 },
    );

    ReadingLoader.clearCache(context, updatedReading!._id);

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
          cursor: toGlobalId('Reading', reading.id),
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
