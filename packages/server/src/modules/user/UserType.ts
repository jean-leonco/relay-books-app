import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { globalIdField, toGlobalId } from 'graphql-relay';
import {
  connectionArgs,
  connectionDefinitions,
  objectIdResolver,
  timestampResolver,
} from '@entria/graphql-mongo-helpers';

import { GraphQLContext } from '../../types';

import { nodeInterface, registerTypeLoader } from '../node/typeRegister';

import * as ReviewLoader from '../review/ReviewLoader';
import { ReviewConnection } from '../review/ReviewType';
import ReviewFiltersInputType from '../review/filters/ReviewFiltersInputType';

import { IUser } from './UserModel';
import { load } from './UserLoader';

// @TODO - add avatar
const UserType = new GraphQLObjectType<IUser, GraphQLContext>({
  name: 'User',
  description: 'User data',
  fields: () => ({
    id: globalIdField('User'),
    ...objectIdResolver,
    name: {
      type: GraphQLString,
      description: 'User name resolver',
      resolve: (obj) => obj.name,
    },
    surname: {
      type: GraphQLString,
      description: 'User surname resolver',
      resolve: (obj) => obj.surname,
    },
    fullName: {
      type: GraphQLString,
      description: 'User name resolver',
      resolve: (obj) => (obj.surname ? `${obj.name} ${obj.surname}` : obj.name),
    },
    email: {
      type: GraphQLString,
      description: 'User email resolver',
      resolve: (obj) => obj.email.email,
    },
    emailWasVerified: {
      type: GraphQLString,
      description: 'User email resolver',
      resolve: (obj) => obj.email.wasVerified,
    },
    lang: {
      type: GraphQLString,
      resolve: (obj) => obj.lang,
    },
    reviews: {
      type: GraphQLNonNull(ReviewConnection.connectionType),
      description: 'Connection to all me reviews',
      args: {
        ...connectionArgs,
        filters: { type: ReviewFiltersInputType },
      },
      resolve: (obj, args, context) => {
        const filters = { ...args.filters, user: toGlobalId('User', obj._id) };
        return ReviewLoader.loadReviews(context, { ...args, filters });
      },
    },
    ...timestampResolver,
  }),
  interfaces: () => [nodeInterface],
});

registerTypeLoader(UserType, load);

export const UserConnection = connectionDefinitions({
  name: 'User',
  nodeType: UserType,
});

export default UserType;
