import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLNonNull, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { GraphQLContext } from '../../types';

import { registerType, NodeInterface } from '../../interface/NodeInterface';

import { connectionDefinitions } from '../../graphql/connection/CustomConnectionType';
import { mongooseIdResolver } from '../../core/mongoose/mongooseIdResolver';
import { mongoDocumentStatusResolvers } from '../../core/graphql/mongoDocumentStatusResolvers';

import Category from './CategoryLoader';

type ConfigType = GraphQLObjectTypeConfig<Category, GraphQLContext>;

const CategoryTypeConfig: ConfigType = {
  name: 'Category',
  description: 'Represents a Category',
  fields: () => ({
    id: globalIdField('Category'),
    name: {
      type: GraphQLString,
      description: 'The category name. ex: Horror',
      resolve: (obj) => obj.name,
    },
    ...mongooseIdResolver,
    ...mongoDocumentStatusResolvers,
  }),
  interfaces: () => [NodeInterface],
};

const CategoryType = registerType(new GraphQLObjectType(CategoryTypeConfig));

export const CategoryConnection = connectionDefinitions({
  name: 'Category',
  nodeType: GraphQLNonNull(CategoryType),
});

export default CategoryType;
