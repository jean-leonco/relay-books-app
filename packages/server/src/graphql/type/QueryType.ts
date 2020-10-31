import { GraphQLObjectType, GraphQLNonNull } from 'graphql';
import { globalIdField, connectionArgs } from 'graphql-relay';

import { NodeField, NodesField } from '../../interface/NodeInterface';
import { GraphQLContext } from '../../types';

import { UserLoader, BookLoader, ReviewLoader, CategoryLoader, ReadingLoader } from '../../loader';

import UserType from '../../modules/user/UserType';

import { BookConnection } from '../../modules/book/BookType';
import BookFiltersInputType from '../../modules/book/filters/BookFiltersInputType';

import { ReviewConnection } from '../../modules/review/ReviewType';
import ReviewFiltersInputType from '../../modules/review/filters/ReviewFiltersInputType';

import { CategoryConnection } from '../../modules/category/CategoryType';
import CategoryFiltersInputType from '../../modules/category/filters/CategoryFiltersInputType';

import { ReadingConnection } from '../../modules/reading/ReadingType';
import ReadingFiltersInputType from '../../modules/reading/filters/ReadingFiltersInputType';

import StatusType from './StatusType';

export default new GraphQLObjectType<any, GraphQLContext, any>({
  name: 'Query',
  description: 'The root of all... queries',
  fields: () => ({
    id: globalIdField('Query'),
    node: NodeField,
    nodes: NodesField,
    me: {
      type: UserType,
      description: 'Me is the logged User',
      resolve: (_, __, context: GraphQLContext) => UserLoader.load(context, context.user && context.user.id),
    },
    status: {
      type: StatusType,
      resolve: () => ({}),
    },

    books: {
      type: GraphQLNonNull(BookConnection.connectionType),
      description: 'Connection to all books',
      args: {
        ...connectionArgs,
        filters: {
          type: BookFiltersInputType,
        },
      },
      resolve: (obj, args, context) => BookLoader.loadBooks(context, args),
    },

    reviews: {
      type: GraphQLNonNull(ReviewConnection.connectionType),
      description: 'Connection to all reviews',
      args: {
        ...connectionArgs,
        filters: {
          type: ReviewFiltersInputType,
        },
      },
      resolve: (obj, args, context) => ReviewLoader.loadReviews(context, args),
    },

    categories: {
      type: GraphQLNonNull(CategoryConnection.connectionType),
      description: 'Connection to all categories',
      args: {
        ...connectionArgs,
        filters: {
          type: CategoryFiltersInputType,
        },
      },
      resolve: (obj, args, context) => CategoryLoader.loadCategories(context, args),
    },

    readings: {
      type: GraphQLNonNull(ReadingConnection.connectionType),
      description: 'Connection to all me readings',
      args: {
        ...connectionArgs,
        filters: {
          type: ReadingFiltersInputType,
        },
      },
      resolve: (obj, args, context) => ReadingLoader.loadReadings(context, args),
    },
  }),
});
