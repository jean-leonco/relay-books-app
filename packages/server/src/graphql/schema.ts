import { GraphQLSchema } from 'graphql';

import applyMiddlewares from '../core/middlewares/applyMiddlewares';

// import SubscriptionType from './subscription/SubscriptionType';
import MutationType from './type/MutationType';
import QueryType from './type/QueryType';

const _schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  // subscription: SubscriptionType,
});

applyMiddlewares(_schema);

export const schema = _schema;
