import { GraphQLString } from 'graphql';

const errorField = {
  error: {
    type: GraphQLString,
    description: 'Default error field resolver for mutations',
    resolve: ({ error }) => error,
  },
};

export default errorField;
