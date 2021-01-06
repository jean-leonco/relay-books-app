import { GraphQLObjectType, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { connectionDefinitions, objectIdResolver, timestampResolver } from '@entria/graphql-mongo-helpers';

import { GraphQLContext } from '../../types';

import { nodeInterface, registerTypeLoader } from '../node/typeRegister';

import { load } from './CategoryLoader';
import { ICategory } from './CategoryModel';

const CategoryType = new GraphQLObjectType<ICategory, GraphQLContext>({
  name: 'Category',
  description: 'Category data',
  fields: () => ({
    id: globalIdField('Category'),
    ...objectIdResolver,
    name: {
      type: GraphQLString,
      description: 'The category name. ex: Horror',
      resolve: (obj) => obj.name,
    },
    ...timestampResolver,
  }),
  interfaces: () => [nodeInterface],
});

registerTypeLoader(CategoryType, load);

export const CategoryConnection = connectionDefinitions({
  name: 'Category',
  nodeType: CategoryType,
});

export default CategoryType;
