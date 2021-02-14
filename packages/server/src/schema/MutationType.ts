import { GraphQLObjectType } from 'graphql';

import ReadingMutations from '../modules/reading/mutations';
import ReviewMutations from '../modules/review/mutations';
import UserMutations from '../modules/user/mutations';

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ...UserMutations,
    ...ReviewMutations,
    ...ReadingMutations,
  }),
});

export default MutationType;
