import { GraphQLNonNull, GraphQLString } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';
import { addMinutes, format } from 'date-fns';

import * as UserLoader from '../UserLoader';
import { GraphQLContext } from '../../../types';

//import SQS_JOBS from '../../../worker/jobs/jobs';
import { getPlatform } from '../../../common/utils';
import { SESSION_TOKEN_SCOPES } from '../../sessionToken/SessionTokenModel';
//import { produceMessage } from '../../../worker/sqs/sqsProducer';
import errorField from '../../../core/graphql/errorField';

import { generateToken, getExpirationTimeByScope, hasReachedMaximumNumberOfSessions } from '../../auth/generateToken';

import UserForgotPasswordSchema from './validationSchemas/UserForgotPasswordSchema';

interface UserForgotPasswordMutationArgs {
  email: string;
}
const mutation = mutationWithClientMutationId({
  name: 'UserForgotPassword',
  inputFields: {
    email: {
      type: GraphQLNonNull(GraphQLString),
    },
  },
  mutateAndGetPayload: async (args: UserForgotPasswordMutationArgs, ctx: GraphQLContext) => {
    const { email } = args;
    const { t } = ctx;

    const user = await UserLoader.findUserByEmail(ctx, email);
    if (!user) {
      return {
        error: t('auth', 'UserNotFound'),
      };
    }

    if (!user.isActive || user.removedAt) {
      return {
        error: t('auth', 'UserDeactivated'),
      };
    }

    if (await hasReachedMaximumNumberOfSessions(user, SESSION_TOKEN_SCOPES.RESET_PASSWORD, 5)) {
      const untilDate = addMinutes(new Date(), getExpirationTimeByScope(SESSION_TOKEN_SCOPES.RESET_PASSWORD)!);
      return {
        error: t('auth', 'TooMuchAttempts', {
          date: format(untilDate, "HH':'mm"),
        }),
      };
    }

    const token = await generateToken(ctx, user, getPlatform(ctx.appplatform), SESSION_TOKEN_SCOPES.RESET_PASSWORD);

    // eslint-disable-next-line no-console
    console.log(token);
    //await produceMessage(SQS_JOBS.USER.FORGOT_PASSWORD, { userId: user._id, token }, {});

    return {
      error: null,
    };
  },
  outputFields: {
    ...errorField,
  },
});

export default {
  validationSchema: UserForgotPasswordSchema,
  ...mutation,
};
