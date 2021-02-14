import { errorField, successField } from '@entria/graphql-mongo-helpers';
import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import { LoggedGraphQLContext, MutationField } from '../../../types';

import * as ReadingLoader from '../ReadingLoader';
import ReadingModel from '../ReadingModel';

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
      { _id: fromGlobalId(id).id, userId: user.id, isActive: true },
      { isActive: false },
    );

    if (!reading) {
      return { error: t('book', 'BookNotFound') };
    }

    ReadingLoader.clearCache(context, reading._id);

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
