import { GraphQLNonNull, GraphQLID, GraphQLString } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import ReadingModel from '../ReadingModel';

import * as ReadingLoader from '../ReadingLoader';

import errorField from '../../../core/graphql/errorField';
import successField from '../../../core/graphql/successField';
import { LoggedGraphQLContext } from '../../../types';

type ReadingRemoveArgs = {
  id: string;
};

const mutation = mutationWithClientMutationId({
  name: 'ReadingRemove',
  inputFields: {
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The global Reading id.',
    },
  },
  mutateAndGetPayload: async (args: ReadingRemoveArgs, context: LoggedGraphQLContext) => {
    const { user, t } = context;
    const { id } = args;

    const reading = await ReadingModel.findOneAndUpdate(
      { _id: fromGlobalId(id).id, userId: user._id, isActive: true },
      { isActive: false },
    );

    if (!reading) {
      return { error: t('book', 'BookNotFound') };
    }

    ReadingLoader.clearAndPrimeCache(context, reading._id, reading);

    return {
      id: reading._id,
      success: t('book', 'BookRemovedWithSuccess'),
      error: null,
    };
  },
  outputFields: {
    deletedID: {
      type: GraphQLString,
      resolve: async ({ id }) => toGlobalId('Reading', id),
    },
    ...successField,
    ...errorField,
  },
});

export default {
  authenticatedOnly: true,
  ...mutation,
};
