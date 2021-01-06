import { GraphQLString, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';
import { errorField, successField } from '@entria/graphql-mongo-helpers';

import { GraphQLContext, MutationField } from '../../../types';

import { TOKEN_SCOPES } from '../../token/TokenModel';
import * as TokenLoader from '../../token/TokenLoader';
import { generateToken, jwtSign } from '../../auth/generateToken';
import { getPlatform } from '../../../security';

import * as UserLoader from '../UserLoader';

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

    const validToken = await TokenLoader.loadValidToken({
      ctx: context,
      user,
      platform: getPlatform(context.appplatform),
      scope: TOKEN_SCOPES.SESSION,
    });

    const token = validToken
      ? jwtSign(validToken)
      : await generateToken({
          ctx: context,
          user,
          scope: TOKEN_SCOPES.SESSION,
          platform: getPlatform(context.appplatform),
        });

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
    ...successField,
    ...errorField,
  },
});

const mutationField: MutationField = {
  extensions: {
    validationSchema: UserLoginMutationSchema,
  },
  ...mutation,
};

export default mutationField;
