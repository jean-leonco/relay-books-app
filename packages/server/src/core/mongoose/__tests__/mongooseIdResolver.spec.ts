import mongoose, { Document, Model } from 'mongoose';
import {
  graphql,
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { toGlobalId, fromGlobalId, globalIdField } from 'graphql-relay';

import { sanitizeTestObject } from '@booksapp/test-utils';

import { clearDbAndRestartCounters, connectMongoose, disconnectMongoose, gql } from '../../../../test/helpers';

import { mongooseIdResolver } from '../mongooseIdResolver';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

const Schema = new mongoose.Schema(
  {
    field: {
      type: String,
      description: 'This is a string field',
      required: true,
    },
  },
  {
    collection: 'MyModel',
  },
);

export interface IMyModel extends Document {
  field: string;
}

const MyModel: Model<IMyModel> = mongoose.model('MyModel', Schema);

const MyType = new GraphQLObjectType<IMyModel>({
  name: 'MyType',
  fields: () => ({
    id: globalIdField('MyType'),
    ...mongooseIdResolver,
    field: {
      type: GraphQLString,
      description: 'This is a string field',
      resolve: (obj) => obj.field,
    },
  }),
});

const query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    _: {
      type: GraphQLBoolean,
      resolve: () => true,
    },
    myType: {
      type: MyType,
      args: {
        id: {
          type: GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (_, args) => await MyModel.findById(fromGlobalId(args.id).id),
    },
  }),
});

const schema = new GraphQLSchema({
  // query is obligatory
  query,
});

describe('Mongoose Id Resolver', () => {
  it('should get myType with mongooseIdResolver', async () => {
    const myModel = await new MyModel({ field: 'value' }).save();

    const query = gql`
      query Q($id: ID!) {
        myType(id: $id) {
          id
          _id
          field
        }
      }
    `;

    const rootValue = {};
    const variables = { id: toGlobalId('MyType', myModel._id) };
    const result = await graphql(schema, query, rootValue, {}, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.myType).not.toBe(null);
    expect(result.data?.myType._id).toEqual(myModel._id.toString());
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });
});
