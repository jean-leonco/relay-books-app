import { connectionDefinitions, objectIdResolver, timestampResolver } from '@entria/graphql-mongo-helpers';
import { GraphQLInt, GraphQLObjectType } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { GraphQLContext } from '../../types';

import * as BookLoader from '../book/BookLoader';
import BookType from '../book/BookType';
import { nodeInterface, registerTypeLoader } from '../node/typeRegister';

import { load } from './ReadingLoader';
import { IReading } from './ReadingModel';

const ReadingType = new GraphQLObjectType<IReading, GraphQLContext>({
  name: 'Reading',
  description: 'Reading data',
  fields: () => ({
    id: globalIdField('Reading'),
    ...objectIdResolver,
    book: {
      type: BookType,
      description: 'The book being read.',
      resolve: async (obj, _args, context) => BookLoader.load(context, obj.bookId),
    },
    readPages: {
      type: GraphQLInt,
      description: 'The total read pages. ex: 50.',
      resolve: (obj) => obj.readPages,
    },
    ...timestampResolver,
  }),
  interfaces: () => [nodeInterface],
});

registerTypeLoader(ReadingType, load);

export const ReadingConnection = connectionDefinitions({
  name: 'Reading',
  nodeType: ReadingType,
});

export default ReadingType;
