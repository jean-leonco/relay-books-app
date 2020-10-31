import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLNonNull, GraphQLFloat, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { GraphQLContext } from '../../types';

import { registerType, NodeInterface } from '../../interface/NodeInterface';

import { connectionDefinitions } from '../../graphql/connection/CustomConnectionType';
import { mongooseIdResolver } from '../../core/mongoose/mongooseIdResolver';
import { mongoDocumentStatusResolvers } from '../../core/graphql/mongoDocumentStatusResolvers';

import { BookLoader, UserLoader } from '../../loader';
import UserType from '../user/UserType';
import BookType from '../book/BookType';

import Review from './ReviewLoader';

type ConfigType = GraphQLObjectTypeConfig<Review, GraphQLContext>;

const ReviewTypeConfig: ConfigType = {
  name: 'Review',
  description: 'Represents a Review',
  fields: () => ({
    id: globalIdField('Review'),
    ...mongooseIdResolver,
    user: {
      type: UserType,
      description: 'The user who created this review.',
      resolve: async (obj, args, context) => await UserLoader.load(context, obj.userId),
    },
    book: {
      type: BookType,
      description: 'The book rated on this review.',
      resolve: async (obj, args, context) => await BookLoader.load(context, obj.bookId),
    },
    rating: {
      type: GraphQLFloat,
      description: 'The rating of the review. ex: 4.5',
      resolve: (obj) => obj.rating,
    },
    description: {
      type: GraphQLString,
      description: 'The review description. ex: This book is awesome',
      resolve: (obj) => obj.description,
    },
    ...mongoDocumentStatusResolvers,
  }),
  interfaces: () => [NodeInterface],
};

const ReviewType = registerType(new GraphQLObjectType(ReviewTypeConfig));

export const ReviewConnection = connectionDefinitions({
  name: 'Review',
  nodeType: GraphQLNonNull(ReviewType),
});

export default ReviewType;
