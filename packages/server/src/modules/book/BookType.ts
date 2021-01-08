import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLBoolean } from 'graphql';
import { globalIdField, toGlobalId } from 'graphql-relay';
import {
  connectionArgs,
  connectionDefinitions,
  objectIdResolver,
  timestampResolver,
} from '@entria/graphql-mongo-helpers';

import { GraphQLContext } from '../../types';

import { nodeInterface, registerTypeLoader } from '../node/typeRegister';

import * as ReviewLoader from '../review/ReviewLoader';
import { ReviewConnection } from '../review/ReviewType';
import ReviewFiltersInputType from '../review/filters/ReviewFiltersInputType';

import * as ReadingLoader from '../reading/ReadingLoader';

import { IBook } from './BookModel';
import { load } from './BookLoader';

const BookType = new GraphQLObjectType<IBook, GraphQLContext>({
  name: 'Book',
  description: 'Book data',
  fields: () => ({
    id: globalIdField('Book'),
    ...objectIdResolver,
    name: {
      type: GraphQLString,
      description: 'The book name. ex: O Alienista',
      resolve: (obj) => obj.name,
    },
    author: {
      type: GraphQLString,
      description: 'The book author. ex: Machado de Assis',
      resolve: (obj) => obj.author,
    },
    description: {
      type: GraphQLString,
      description: 'The book description.',
      resolve: (obj) => obj.description,
    },
    releaseYear: {
      type: GraphQLInt,
      description: 'The book release year. ex: 1882',
      resolve: (obj) => obj.releaseYear,
    },
    pages: {
      type: GraphQLInt,
      description: 'The book total page. ex: 96',
      resolve: (obj) => obj.pages,
    },
    bannerUrl: {
      type: GraphQLString,
      description: 'The book banner url.',
      resolve: (obj) => obj.bannerUrl,
    },
    ISBN: {
      type: GraphQLInt,
      description: 'The book banner ISBN. ex: 9780850515060',
      resolve: (obj) => obj.ISBN,
    },
    language: {
      type: GraphQLString,
      description: 'The book language. ex: Portuguese',
      resolve: (obj) => obj.language,
    },
    rating: {
      type: GraphQLFloat,
      description: 'The book average rating based on user reviews',
      resolve: (obj, _args, context) => ReviewLoader.loadBookAverageRating(context, obj._id),
    },
    reviews: {
      type: ReviewConnection.connectionType,
      description: 'The book reviews',
      args: {
        ...connectionArgs,
        filters: { type: ReviewFiltersInputType },
      },
      resolve: (obj, args, context) => {
        const filters = { ...args.filters, book: toGlobalId('Book', obj._id) };
        return ReviewLoader.loadAll(context, { ...args, filters });
      },
    },
    meCanReview: {
      type: GraphQLBoolean,
      description: 'Retuns if the context user can review the book',
      resolve: async (obj, _args, context) => ReadingLoader.loadMeCanReview(context, obj),
    },
    ...timestampResolver,
  }),
  interfaces: () => [nodeInterface],
});

registerTypeLoader(BookType, load);

export const BookConnection = connectionDefinitions({
  name: 'Book',
  nodeType: BookType,
});

export default BookType;
