import { GraphQLObjectType } from 'graphql';

import UserMutations from '../../modules/user/mutations';
import ReviewMutations from '../../modules/review/mutations';
import ReadingMutations from '../../modules/reading/mutations';

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ...UserMutations,
    ...ReviewMutations,
    ...ReadingMutations,
  }),
});
