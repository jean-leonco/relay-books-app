import { connectionArgs } from '@entria/graphql-mongo-helpers';
import { GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { globalIdField } from 'graphql-relay';

import * as BookLoader from '../modules/book/BookLoader';
import BookType, { BookConnection } from '../modules/book/BookType';
import BookFiltersInputType from '../modules/book/filters/BookFiltersInputType';

import * as CategoryLoader from '../modules/category/CategoryLoader';
import { CategoryConnection } from '../modules/category/CategoryType';
import CategoryFiltersInputType from '../modules/category/filters/CategoryFiltersInputType';
import { nodeField, nodesField } from '../modules/node/typeRegister';

import ReadingFiltersInputType from '../modules/reading/filters/ReadingFiltersInputType';
import * as ReadingLoader from '../modules/reading/ReadingLoader';
import { ReadingConnection } from '../modules/reading/ReadingType';
import ReviewFiltersInputType from '../modules/review/filters/ReviewFiltersInputType';
import * as ReviewLoader from '../modules/review/ReviewLoader';
import { ReviewConnection } from '../modules/review/ReviewType';
import * as UserLoader from '../modules/user/UserLoader';
import UserType from '../modules/user/UserType';
import { GraphQLContext } from '../types';

const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'The root of all queries.',
  fields: () => ({
    id: globalIdField('Query'),
    node: nodeField,
    nodes: nodesField,

    me: {
      type: UserType,
      description: 'Me is the logged User.',
      resolve: (_obj, _args, context: GraphQLContext) => UserLoader.load(context, context.user && context.user.id),
    },

    books: {
      type: GraphQLNonNull(BookConnection.connectionType),
      description: 'Connection to all books.',
      args: {
        ...connectionArgs,
        filters: {
          type: BookFiltersInputType,
        },
      },
      resolve: (_obj, args, context) =>
        args.filters?.trending ? BookLoader.loadTrendingBooks(context) : BookLoader.loadAll(context, args),
    },

    todaySuggestion: {
      type: BookType,
      description: "The today's suggestion",
      resolve: (_obj, _args, context) => BookLoader.loadTodaySuggestion(context),
    },

    reviews: {
      type: GraphQLNonNull(ReviewConnection.connectionType),
      description: 'Connection to all reviews.',
      args: {
        ...connectionArgs,
        filters: {
          type: ReviewFiltersInputType,
        },
      },
      resolve: (_obj, args, context) => ReviewLoader.loadAll(context, args),
    },

    categories: {
      type: GraphQLNonNull(CategoryConnection.connectionType),
      description: 'Connection to all categories.',
      args: {
        ...connectionArgs,
        filters: {
          type: CategoryFiltersInputType,
        },
      },
      resolve: (_obj, args, context) => CategoryLoader.loadAll(context, args),
    },

    readings: {
      type: GraphQLNonNull(ReadingConnection.connectionType),
      description: 'Connection to all me readings.',
      args: {
        ...connectionArgs,
        filters: {
          type: ReadingFiltersInputType,
        },
      },
      resolve: (_obj, args, context) => ReadingLoader.loadAll(context, args),
    },
  }),
});

export default QueryType;
