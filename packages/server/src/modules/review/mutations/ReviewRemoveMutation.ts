import { GraphQLNonNull, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';
import { errorField, successField } from '@entria/graphql-mongo-helpers';

import { LoggedGraphQLContext, MutationField } from '../../../types';

import ReviewModel from '../ReviewModel';
import * as ReviewLoader from '../ReviewLoader';

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
  extensions: {
    authenticatedOnly: true,
  },
  ...mutation,
};

export default mutationField;
