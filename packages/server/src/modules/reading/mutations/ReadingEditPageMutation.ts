import { GraphQLNonNull, GraphQLID, GraphQLInt } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import ReadingModel from '../ReadingModel';

import * as ReadingLoader from '../ReadingLoader';
import { ReadingConnection } from '../ReadingType';

import errorField from '../../../core/graphql/errorField';
import { LoggedGraphQLContext } from '../../../types';
import { Reading } from '../../../models';
import { BookLoader } from '../../../loader';

type ReadingEditPageArgs = {
  id: string;
  currentPage: number;
};

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

    const reading = await Reading.findOne({ _id: fromGlobalId(id).id, userId: user._id });

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
      { _id: fromGlobalId(id).id, userId: user._id },
      { readPages: currentPage || 1 },
    );

    ReadingLoader.clearAndPrimeCache(context, updatedReading!._id, updatedReading!);

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
