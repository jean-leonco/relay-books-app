import { GraphQLBoolean, GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { GraphQLContext } from '../../types';

import { NodeInterface, registerType } from '../../interface/NodeInterface';
import * as UserLoader from '../user/UserLoader';
import UserType from '../user/UserType';

import { connectionDefinitions } from '../../graphql/connection/CustomConnectionType';

import { mongooseIdResolver } from '../../core/mongoose/mongooseIdResolver';

import { mongoDocumentStatusResolvers } from '../../core/graphql/mongoDocumentStatusResolvers';

import SessionToken from './SessionTokenLoader';

type ConfigType = GraphQLObjectTypeConfig<SessionToken, GraphQLContext>;

const SessionTokenConfigType: ConfigType = {
  name: 'SessionToken',
  description: 'Represents SessionToken',
  fields: () => ({
    id: globalIdField('SessionToken'),
    ...mongooseIdResolver,
    user: {
      type: UserType,
      description: 'User owner of this token.',
      resolve: async (obj, args, context) => await UserLoader.load(context, obj.user),
    },
    ip: {
      type: GraphQLString,
      description: 'Agent IP that came from request headers.',
      resolve: (obj) => obj.ip,
    },
    channel: {
      type: GraphQLString,
      description: 'Channel that this token belongs too. ex: APP',
      resolve: (obj) => obj.channel,
    },
    isBlocked: {
      type: GraphQLBoolean,
      description: 'If the token is blocked.',
      resolve: (obj) => obj.isBlocked,
    },
    name: {
      type: GraphQLString,
      description: 'Name of this token. ex: Jean Linux',
      resolve: (obj) => obj.name,
    },
    scope: {
      type: GraphQLString,
      description: 'Scope of this session token. ex: SESSION',
      resolve: (obj) => obj.scope,
    },
    expiresIn: {
      type: GraphQLString,
      description: 'When this session token expires.',
      resolve: (obj) => (obj.expiresIn ? obj.expiresIn.toISOString() : null),
    },
    ...mongoDocumentStatusResolvers,
  }),
  interfaces: () => [NodeInterface],
};

const SessionTokenType = registerType(new GraphQLObjectType(SessionTokenConfigType));

export const SessionTokenConnection = connectionDefinitions({
  name: 'SessionToken',
  nodeType: SessionTokenType,
});

export default SessionTokenType;
