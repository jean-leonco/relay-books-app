import { GraphQLString } from 'graphql';

const successField = {
  success: {
    type: GraphQLString,
    description: 'Default success field resolver for mutations',
    resolve: ({ success }) => success,
  },
};

export default successField;
