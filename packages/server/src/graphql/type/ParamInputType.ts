import { GraphQLInputObjectType, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

export const ParamInputType = new GraphQLInputObjectType({
  name: 'ParamInput',
  description: 'Represent a key value param',
  fields: () => ({
    key: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Parameter key',
    },
    value: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Parameter value',
    },
  }),
});

export const ParameterType = new GraphQLObjectType({
  name: 'Parameter',
  description: 'Represents a key value parameter',
  fields: () => ({
    key: {
      type: GraphQLString,
      description: 'Parameter key',
      resolve: (obj) => obj.key,
    },
    value: {
      type: GraphQLString,
      description: 'Parameter value',
      resolve: (obj) => obj.value,
    },
  }),
});

export default ParamInputType;
