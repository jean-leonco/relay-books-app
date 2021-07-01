import { errorField, successField } from '@entria/graphql-mongo-helpers';
import { GraphQLString } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';

import { LoggedGraphQLContext, MutationField } from '../../../types';

import * as UserLoader from '../UserLoader';
import UserModel from '../UserModel';
import UserType from '../UserType';

import UserRegistrationMutationSchema from './validationSchemas/UserRegistrationMutationSchema';

interface MeEditMutationArgs {
  name?: string;
  email?: string;
  password?: string;
}

const mutation = mutationWithClientMutationId({
  name: 'MeEdit',
  inputFields: {
    name: {
      type: GraphQLString,
      description: 'User name. ex: Jean',
    },
    email: {
      type: GraphQLString,
      description: 'User email to be used on login. ex: jean@gmail.com',
    },
    password: {
      type: GraphQLString,
      description: 'User password.',
    },
  },
  mutateAndGetPayload: async (args: MeEditMutationArgs, context: LoggedGraphQLContext) => {
    const { email, password } = args;
    const { user, t } = context;

    const fullName = args.name ? args.name.split(' ') : [''];
    const name = fullName[0];
    const surname = fullName.length > 1 ? fullName.splice(1, fullName.length).join(' ') : '';

    if (email) {
      const userEmailExists = await UserLoader.meEmailExists(context, email);

      if (userEmailExists) {
        return {
          error: t('auth', 'TheEmailIsAlreadyAssociated'),
        };
      }
    }

    const userNewInfo = {
      ...(name ? { name } : {}),
      ...(name ? { surname } : {}),
      ...(email ? { email: { email, wasVerified: true } } : {}),
      ...(password ? { password } : {}),
    };

    const updatedUser = await UserModel.findOneAndUpdate({ _id: user.id, isActive: true }, userNewInfo);

    if (!updatedUser) {
      return {
        id: null,
        error: t('auth', 'UserNotFound'),
      };
    }

    UserLoader.clearCache(context, updatedUser._id);

    return {
      id: updatedUser._id,
      error: null,
    };
  },
  outputFields: {
    me: {
      type: UserType,
      resolve: async ({ id }, _, context) => {
        const newUser = await UserLoader.load(context, id);

        if (!newUser) {
          return null;
        }

        return newUser;
      },
    },
    ...successField,
    ...errorField,
  },
});

const mutationField: MutationField = {
  ...mutation,
  extensions: {
    authenticatedOnly: true,
    validationSchema: UserRegistrationMutationSchema,
  },
};

export default mutationField;
