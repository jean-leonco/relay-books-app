import { errorField, successField } from '@entria/graphql-mongo-helpers';
import { GraphQLID, GraphQLNonNull } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';

import { LoggedGraphQLContext, MutationField } from '../../../types';

import * as ReviewLoader from '../ReviewLoader';
import ReviewModel from '../ReviewModel';

interface ReviewRemoveArgs {
  id: string;
}

const mutation = mutationWithClientMutationId({
  name: 'ReviewRemove',
  inputFields: {
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The global review id.',
    },
  },
  mutateAndGetPayload: async (args: ReviewRemoveArgs, context: LoggedGraphQLContext) => {
    const { user, t } = context;
    const { id } = args;

    const review = await ReviewModel.findOneAndUpdate(
      { _id: fromGlobalId(id).id, userId: user.id, isActive: true },
      { isActive: false },
    );

    if (!review) {
      return { error: t('review', 'ReviewNotFound') };
    }

    ReviewLoader.clearCache(context, review._id);

    return {
      success: true,
      error: null,
    };
  },
  outputFields: {
    ...successField,
    ...errorField,
  },
});

const mutationField: MutationField = {
  ...mutation,
  extensions: {
    authenticatedOnly: true,
  },
};

export default mutationField;
