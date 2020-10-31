import { GraphQLNonNull, GraphQLString } from 'graphql';
import { Types } from 'mongoose';

type MongooseModel = {
  _id: Types.ObjectId;
};

export const mongooseIdResolver = {
  _id: {
    type: GraphQLNonNull(GraphQLString),
    description: 'MongoDB _id',
    resolve: ({ _id }: MongooseModel) => _id.toString(),
  },
};
