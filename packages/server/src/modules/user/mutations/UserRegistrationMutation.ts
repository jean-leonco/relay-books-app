import { GraphQLString, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';

import UserModel from '../UserModel';

import errorField from '../../../core/graphql/errorField';

import { LoggedGraphQLContext } from '../../../types';
import { UserLoader } from '../../../loader';
import { getPlatform } from '../../../common/utils';
import { SESSION_TOKEN_SCOPES } from '../../../models';

import { generateToken } from '../../auth/generateToken';

import UserRegistrationMutationSchema from './validationSchemas/UserRegistrationMutationSchema';

interface UserRegistrationAddArgs {
  name: string;
  email: string;
  password: string;
}

const mutation = mutationWithClientMutationId({
  name: 'UserRegistration',
  inputFields: {
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'User name. ex: Jean',
    },
    email: {
      type: GraphQLNonNull(GraphQLString),
      description: 'User email to be used on login. ex: jean@gmail.com',
    },
    password: {
      type: GraphQLNonNull(GraphQLString),
      description: 'User password.',
    },
  },
  mutateAndGetPayload: async (args: UserRegistrationAddArgs, context: LoggedGraphQLContext) => {
    const { t } = context;

    const { email, password } = args;

    const userEmailExists = await UserLoader.userEmailExists(context, email);

    if (userEmailExists) {
      return {
        error: t('auth', 'TheEmailIsAlreadyAssociated'),
      };
    }

    const fullName = args.name.split(' ');
    const name = fullName[0];
    const surname = fullName.length > 1 ? fullName.splice(1, fullName.length).join(' ') : '';

    const user = await new UserModel({
      name,
      surname: surname || '',
      email: { email, wasVerified: true },
      password,
    }).save();

    const token = await generateToken(context, user, getPlatform(context.appplatform), SESSION_TOKEN_SCOPES.SESSION);

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
  validationSchema: UserRegistrationMutationSchema,
  ...mutation,
};
