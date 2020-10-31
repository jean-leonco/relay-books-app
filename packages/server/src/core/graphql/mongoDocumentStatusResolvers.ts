import { GraphQLBoolean, GraphQLString } from 'graphql';

export const mongoDocumentStatusResolvers = {
  isActive: {
    type: GraphQLBoolean,
    description: 'The soft delete status.',
    resolve: (obj) => obj.isActive,
  },
  removedAt: {
    type: GraphQLString,
    description: 'The hard delete status.',
    resolve: (obj) => (obj.removedAt ? obj.removedAt.toISOString() : null),
  },
  createdAt: {
    type: GraphQLString,
    description: 'The date that the node was created.',
    resolve: (obj) => (obj.createdAt ? obj.createdAt.toISOString() : null),
  },
  updatedAt: {
    type: GraphQLString,
    description: 'The date that the node was last updated.',
    resolve: (obj) => (obj.updatedAt ? obj.updatedAt.toISOString() : null),
  },
};
