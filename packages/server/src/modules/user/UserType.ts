import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
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

import * as ReadingLoader from '../reading/ReadingLoader';

import ReadingType from '../reading/ReadingType';

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
      description: 'The user name. Ex: Jean.',
      resolve: (obj) => obj.name,
    },
    surname: {
      type: GraphQLString,
      description: 'The user surname. Ex: Leonço.',
      resolve: (obj) => obj.surname,
    },
    fullName: {
      type: GraphQLString,
      description: 'The user full name. Ex: Jean Leonço.',
      resolve: (obj) => (obj.surname ? `${obj.name} ${obj.surname}` : obj.name),
    },
    email: {
      type: GraphQLString,
      description: 'The user email. Ex: jean@booksapp.com.',
      resolve: (obj) => obj.email.email,
    },
    emailWasVerified: {
      type: GraphQLString,
      description: 'If the user email was verified.',
      resolve: (obj) => obj.email.wasVerified,
    },
    lang: {
      type: GraphQLString,
      description: 'The user language. Ex: en.',
      resolve: (obj) => obj.lang,
    },
    reviews: {
      type: GraphQLNonNull(ReviewConnection.connectionType),
      description: 'Connection to all me reviews.',
      args: {
        ...connectionArgs,
        filters: { type: ReviewFiltersInputType },
      },
      resolve: (obj, args, context) => {
        const filters = { ...args.filters, user: toGlobalId('User', obj.id) };
        return ReviewLoader.loadAll(context, { ...args, filters });
      },
    },
    lastIncompleteReading: {
      type: ReadingType,
      description: 'The last incomplete reading.',
      resolve: (_obj, _args, context) => ReadingLoader.loadMeLastIncompleteReading(context),
    },
    hasReading: {
      type: GraphQLBoolean,
      description: 'If user has a reading.',
      resolve: (_obj, _args, context) => ReadingLoader.loadMeHasReading(context),
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
