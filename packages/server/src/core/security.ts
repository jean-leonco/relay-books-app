import { GraphQLContext, LoggedGraphQLContext } from '../types';

import { User } from '../loader';

export const isLoggedIn = (context: GraphQLContext | LoggedGraphQLContext) => {
  const { user } = context;

  if (user instanceof User) {
    return true;
  }

  return false;
};
