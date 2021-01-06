import { GraphQLObjectType, GraphQLFloat, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { connectionDefinitions, objectIdResolver, timestampResolver } from '@entria/graphql-mongo-helpers';

import { GraphQLContext } from '../../types';

import { nodeInterface, registerTypeLoader } from '../node/typeRegister';

import * as UserLoader from '../user/UserLoader';
import UserType from '../user/UserType';

import * as BookLoader from '../book/BookLoader';
import BookType from '../book/BookType';

import { IReview } from './ReviewModel';
import { load } from './ReviewLoader';

const ReviewType = new GraphQLObjectType<IReview, GraphQLContext>({
  name: 'Review',
  description: 'Review data',
  fields: () => ({
    id: globalIdField('Review'),
    ...objectIdResolver,
    user: {
      type: UserType,
      description: 'The user who created this review.',
      resolve: async (obj, _args, context) => await UserLoader.load(context, obj.userId),
    },
    book: {
      type: BookType,
      description: 'The book rated on this review.',
      resolve: async (obj, _args, context) => await BookLoader.load(context, obj.bookId),
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
    ...timestampResolver,
  }),
  interfaces: () => [nodeInterface],
});

registerTypeLoader(ReviewType, load);

export const ReviewConnection = connectionDefinitions({
  name: 'Review',
  nodeType: ReviewType,
});

export default ReviewType;
