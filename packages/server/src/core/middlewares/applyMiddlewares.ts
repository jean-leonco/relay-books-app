import { addMiddleware } from 'graphql-add-middleware';

import { GraphQLSchema } from 'graphql';

import authenticatedOnlyMutation from './authenticatedOnlyMutation';
import validationSchemaMutation from './validationSchemaMutation';

export default function applyMiddlewares(schema: GraphQLSchema) {
  addMiddleware(schema, 'Mutation', authenticatedOnlyMutation);
  addMiddleware(schema, 'Mutation', validationSchemaMutation);
}
