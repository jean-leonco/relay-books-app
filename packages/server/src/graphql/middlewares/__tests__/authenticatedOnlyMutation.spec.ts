import { graphql, GraphQLBoolean, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

import { connectMongoose, clearDbAndRestartCounters, disconnectMongoose, gql } from '@workspace/test-utils';

import applyMiddlewares from '../applyMiddlewares';

import { createUser, getContext } from '../../../test/utils';

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

const mutationType = new GraphQLObjectType({
  name: 'AuthenticatedMiddlewareResponse',
  fields: () => ({
    error: { type: GraphQLString },
  }),
});

const mutationArgs = {
  testBool: {
    type: GraphQLBoolean,
  },
};

const mutationResolve = () => ({ error: null });

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    TestAuthenticatedMiddleware: {
      name: 'TestAuthenticatedMiddleware',
      type: mutationType,
      args: mutationArgs,
      extensions: {
        authenticatedOnly: true,
      },
      resolve: mutationResolve,
    },
    TestNoAuthenticatedMiddleware: {
      name: 'TestNoAuthenticatedMiddleware',
      type: mutationType,
      args: mutationArgs,
      extensions: {
        authenticatedOnly: false,
      },
      resolve: mutationResolve,
    },
  }),
});

const schema = new GraphQLSchema({
  query,
  mutation,
});

applyMiddlewares(schema);

describe('authenticatedOnlyMutation', () => {
  it('should not execute mutation if authenticatedOnly = true and user is not on ctx', async () => {
    const query = gql`
      mutation M {
        TestAuthenticatedMiddleware(testBool: true) {
          error
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, query, rootValue, context);

    expect(result.data?.TestAuthenticatedMiddleware.error).toBe('Unauthorized');
  });

  it('should execute mutation if authenticatedOnly = true and user is on ctx', async () => {
    const user = await createUser();

    const query = gql`
      mutation M {
        TestAuthenticatedMiddleware(testBool: true) {
          error
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const result = await graphql(schema, query, rootValue, context);

    expect(result.data?.TestAuthenticatedMiddleware.error).toBe(null);
  });

  it('should execute mutation if authenticatedOnly = false and return error null', async () => {
    const query = gql`
      mutation M {
        TestNoAuthenticatedMiddleware(testBool: true) {
          error
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, query, rootValue, context);

    expect(result.data?.TestNoAuthenticatedMiddleware.error).toBe(null);
  });
});
