import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, graphql } from 'graphql';
import * as yup from 'yup';

import { clearDbAndRestartCounters, connectMongoose, disconnectMongoose, gql } from '@workspace/test-utils';

import { getContext } from '../../../test/utils';

import applyMiddlewares from '../applyMiddlewares';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

const query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    _: {
      type: GraphQLBoolean,
      resolve: () => true,
    },
  }),
});

const ValidationSchemaMiddlewareSchema = () => {
  const schema = yup.object().shape({
    name: yup.string().required('Name is required.'),
    description: yup.string().max(140, 'Description should be less than 140'),
  });

  return schema;
};

const mutationType = new GraphQLObjectType({
  name: 'ValidationSchemaResponse',
  fields: () => ({
    error: { type: GraphQLString },
  }),
});

const mutationArgs = {
  name: { type: GraphQLNonNull(GraphQLString) },
  description: { type: GraphQLString },
};

const mutationResolve = () => ({ error: null });

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ValidationSchemaMiddleware: {
      name: 'ValidationSchemaMiddleware',
      type: mutationType,
      args: mutationArgs,
      extensions: {
        validationSchema: ValidationSchemaMiddlewareSchema,
      },
      resolve: mutationResolve,
    },
    NoValidationSchemaMiddleware: {
      name: 'NoValidationSchemaMiddleware',
      type: mutationType,
      args: mutationArgs,
      resolve: mutationResolve,
    },
  }),
});

const schema = new GraphQLSchema({
  query,
  mutation,
});

applyMiddlewares(schema);

describe('validationSchemaMutation', () => {
  it('should not execute mutation if validationSchema exists and validation fails', async () => {
    const description = [...Array(141).keys()].map(() => 'T').join('');

    const query = gql`
      mutation M($description: String) {
        ValidationSchemaMiddleware(name: "Test", description: $description) {
          error
        }
      }
    `;

    const variables = { description };
    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.data?.ValidationSchemaMiddleware.error).toBe('Description should be less than 140');
  });

  it('should execute mutation if validationSchema does not exist', async () => {
    const description = [...Array(141).keys()].map(() => 'T').join('');

    const query = gql`
      mutation M($description: String) {
        NoValidationSchemaMiddleware(name: "Test", description: $description) {
          error
        }
      }
    `;

    const variables = { description };
    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.data?.NoValidationSchemaMiddleware.error).toBe(null);
  });

  it('should execute mutation if validationSchema exists and validation does not fail', async () => {
    const query = gql`
      mutation M {
        ValidationSchemaMiddleware(name: "Test", description: "Test") {
          error
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, query, rootValue, context);

    expect(result.data?.ValidationSchemaMiddleware.error).toBe(null);
  });
});
