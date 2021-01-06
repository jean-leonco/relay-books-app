import { GraphQLSchema } from 'graphql';

import applyMiddlewares from '../graphql/middlewares/applyMiddlewares';

import MutationType from './MutationType';
import QueryType from './QueryType';

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});

applyMiddlewares(schema);

export default schema;
