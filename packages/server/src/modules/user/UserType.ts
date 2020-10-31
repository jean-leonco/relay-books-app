import { GraphQLNonNull, GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLString } from 'graphql';
import { globalIdField, toGlobalId } from 'graphql-relay';

import { NodeInterface, registerType } from '../../interface/NodeInterface';
import { connectionArgs } from '../../graphql/connection/CustomConnectionType';
import { GraphQLContext } from '../../types';

import { mongooseIdResolver } from '../../core/mongoose/mongooseIdResolver';
import { mongoDocumentStatusResolvers } from '../../core/graphql/mongoDocumentStatusResolvers';

import { ReviewLoader } from '../../loader';

import { ReviewConnection } from '../review/ReviewType';
import ReviewFiltersInputType from '../review/filters/ReviewFiltersInputType';

import User from './UserLoader';

type ConfigType = GraphQLObjectTypeConfig<User, GraphQLContext>;

// @TODO - add avatar
const UserTypeConfig: ConfigType = {
  name: 'User',
  description: 'Represents an user',
  fields: () => ({
    id: globalIdField('User'),
    ...mongooseIdResolver,
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
        filters: {
          type: ReviewFiltersInputType,
        },
      },
      resolve: (obj, args, context) => {
        const filters = { ...args.filters, user: toGlobalId('User', obj._id) };
        return ReviewLoader.loadReviews(context, { ...args, filters });
      },
    },
    ...mongoDocumentStatusResolvers,
  }),
  interfaces: () => [NodeInterface],
};

const UserType = registerType(new GraphQLObjectType(UserTypeConfig));

export default UserType;
