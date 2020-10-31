import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLNonNull, GraphQLInt } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { GraphQLContext } from '../../types';

import { registerType, NodeInterface } from '../../interface/NodeInterface';

import { connectionDefinitions } from '../../graphql/connection/CustomConnectionType';
import { mongooseIdResolver } from '../../core/mongoose/mongooseIdResolver';
import { mongoDocumentStatusResolvers } from '../../core/graphql/mongoDocumentStatusResolvers';

import BookType from '../book/BookType';
import { BookLoader } from '../../loader';

import Reading from './ReadingLoader';

type ConfigType = GraphQLObjectTypeConfig<Reading, GraphQLContext>;

const ReadingTypeConfig: ConfigType = {
  name: 'Reading',
  description: 'Represents a Reading',
  fields: () => ({
    id: globalIdField('Reading'),
    ...mongooseIdResolver,
    book: {
      type: BookType,
      description: 'The book being read.',
      resolve: async (obj, args, context) => BookLoader.load(context, obj.bookId),
    },
    readPages: {
      type: GraphQLInt,
      description: 'The total read pages. ex: 50',
      resolve: (obj) => obj.readPages,
    },
    ...mongoDocumentStatusResolvers,
  }),
  interfaces: () => [NodeInterface],
};

const ReadingType = registerType(new GraphQLObjectType(ReadingTypeConfig));

export const ReadingConnection = connectionDefinitions({
  name: 'Reading',
  nodeType: GraphQLNonNull(ReadingType),
});

export default ReadingType;
