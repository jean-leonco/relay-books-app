import { GraphQLSchema } from 'graphql';
import { addMiddleware } from 'graphql-add-middleware';

import authenticatedOnlyMutation from './authenticatedOnlyMutation';
import validationSchemaMutation from './validationSchemaMutation';

const applyMiddlewares = (schema: GraphQLSchema) => {
  addMiddleware(schema, 'Mutation', authenticatedOnlyMutation);
  addMiddleware(schema, 'Mutation', validationSchemaMutation);
};

export default applyMiddlewares;
