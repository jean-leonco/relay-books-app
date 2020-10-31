import { GraphQLNonNull, GraphQLID } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';

import ReviewModel from '../ReviewModel';

import * as ReviewLoader from '../ReviewLoader';

import errorField from '../../../core/graphql/errorField';
import successField from '../../../core/graphql/successField';
import { LoggedGraphQLContext } from '../../../types';

type ReviewRemoveArgs = {
  id: string;
};

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
      { _id: fromGlobalId(id).id, userId: user._id, isActive: true },
      { isActive: false },
    );

    if (!review) {
      return { error: t('review', 'ReviewNotFound') };
    }

    ReviewLoader.clearAndPrimeCache(context, review._id, review);

    return {
      success: t('review', 'ReviewRemovedWithSuccess'),
      error: null,
    };
  },
  outputFields: {
    ...successField,
    ...errorField,
  },
});

export default {
  authenticatedOnly: true,
  ...mutation,
};
