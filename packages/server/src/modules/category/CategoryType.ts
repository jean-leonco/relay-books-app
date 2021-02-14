import { connectionDefinitions, objectIdResolver, timestampResolver } from '@entria/graphql-mongo-helpers';
import { GraphQLObjectType, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';

import i18n from '../../i18n';
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
      resolve: (obj) => obj.translation[i18n.language] || obj.translation['en'],
    },
    key: {
      type: GraphQLString,
      description: 'The category key. ex: horror',
      resolve: (obj) => obj.key,
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
