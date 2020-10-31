import { GraphQLString, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';

import { GraphQLContext } from '../../../types';
import * as UserLoader from '../UserLoader';
import { getPlatform } from '../../../common/utils';
import { SESSION_TOKEN_SCOPES } from '../../sessionToken/SessionTokenModel';
import * as SessionTokenLoader from '../../sessionToken/SessionTokenLoader';
import errorField from '../../../core/graphql/errorField';

import { jwtSign, generateToken } from '../../auth/generateToken';

import UserLoginMutationSchema from './validationSchemas/UserLoginMutationSchema';

interface UserLoginArgs {
  email: string;
  password: string;
}

const mutation = mutationWithClientMutationId({
  name: 'UserLogin',
  inputFields: {
    email: {
      type: GraphQLNonNull(GraphQLString),
      description: 'User email to be used on login. ex: jean@gmail.com',
    },
    password: {
      type: GraphQLNonNull(GraphQLString),
      description: 'User password.',
    },
  },
  mutateAndGetPayload: async (args: UserLoginArgs, context: GraphQLContext) => {
    const { email, password } = args;
    const { t } = context;

    const user = await UserLoader.findUserByEmail(context, email, false);

    if (!user) {
      return {
        error: t('auth', 'UserNotFound'),
      };
    }

    const correctPassword = await user.authenticate(password);

    if (!correctPassword) {
      return {
        error: t('auth', 'UserInvalidCredentials'),
      };
    }

    const validSessionToken = await SessionTokenLoader.loadValidSessionToken(
      context,
      user,
      getPlatform(context.appplatform),
      SESSION_TOKEN_SCOPES.SESSION,
    );

    const token = validSessionToken
      ? jwtSign(validSessionToken)
      : await generateToken(context, user, getPlatform(context.appplatform), SESSION_TOKEN_SCOPES.SESSION);

    return {
      token,
      error: null,
    };
  },
  outputFields: {
    token: {
      type: GraphQLString,
      resolve: ({ token }) => token,
    },
    ...errorField,
  },
});

export default {
  validationSchema: UserLoginMutationSchema,
  ...mutation,
};
