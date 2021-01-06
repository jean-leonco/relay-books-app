import { GraphQLNonNull, GraphQLID, GraphQLString } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';
import { errorField, successField } from '@entria/graphql-mongo-helpers';

import { LoggedGraphQLContext, MutationField } from '../../../types';

import ReadingModel from '../ReadingModel';
import * as ReadingLoader from '../ReadingLoader';

interface ReadingRemoveArgs {
  id: string;
}

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
      success: true,
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

const mutationField: MutationField = {
  extensions: {
    authenticatedOnly: true,
  },
  ...mutation,
};

export default mutationField;
