import { graphql, GraphQLBoolean, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

import { sanitizeTestObject } from '@booksapp/test-utils';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createUser,
  disconnectMongoose,
  getContext,
  gql,
} from '../../../../test/helpers';

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

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    TestAuthenticatedMiddlewareMutation: {
      name: 'TestAuthenticatedMiddlewareMutation',
      type: new GraphQLObjectType({
        name: 'TestAuthenticatedResponse',
        fields: () => ({
          error: {
            type: GraphQLString,
          },
        }),
      }),
      args: {
        argString: {
          type: GraphQLString,
        },
        argStringArray: {
          type: new GraphQLList(GraphQLString),
        },
        argBoolean: {
          type: GraphQLBoolean,
        },
      },
      authenticatedOnly: true,
      resolve: () => {
        return {
          error: null,
        };
      },
    },
    TestNoAuthenticatedMiddlewareMutation: {
      name: 'TestNoAuthenticatedMiddlewareMutation',
      type: new GraphQLObjectType({
        name: 'TestNoAuthenticatedResponse',
        fields: () => ({
          error: {
            type: GraphQLString,
          },
        }),
      }),
      args: {
        argString: {
          type: GraphQLString,
        },
        argStringArray: {
          type: new GraphQLList(GraphQLString),
        },
        argBoolean: {
          type: GraphQLBoolean,
        },
      },
      authenticatedOnly: false,
      resolve: () => {
        return {
          error: null,
        };
      },
    },
  }),
});

const schema = new GraphQLSchema({
  // query is obligatory
  query,
  // mutation type
  mutation,
});

applyMiddlewares(schema);

it('should not execute mutation if authenticatedOnly true and return error auth.userUnauthenticated', async () => {
  const query = gql`
    mutation M {
      TestAuthenticatedMiddlewareMutation(
        argString: "Teste"
        argStringArray: ["teste", "teste", "teste"]
        argBoolean: true
      ) {
        error
      }
    }
  `;

  const rootValue = {};
  const context = await getContext();
  const result = await graphql(schema, query, rootValue, context);

  expect(sanitizeTestObject(result)).toMatchSnapshot();
});

it('should execute mutation if authenticatedOnly true and return error null', async () => {
  const user = await createUser();

  const query = gql`
    mutation M {
      TestAuthenticatedMiddlewareMutation(
        argString: "Teste"
        argStringArray: ["teste", "teste", "teste"]
        argBoolean: true
      ) {
        error
      }
    }
  `;

  const rootValue = {};
  const context = await getContext({ user });
  const result = await graphql(schema, query, rootValue, context);

  expect(sanitizeTestObject(result)).toMatchSnapshot();
});

it('should execute mutation if authenticatedOnly false and return error null', async () => {
  const query = gql`
    mutation M {
      TestNoAuthenticatedMiddlewareMutation(
        argString: "Teste"
        argStringArray: ["teste", "teste", "teste"]
        argBoolean: true
      ) {
        error
      }
    }
  `;

  const rootValue = {};
  const context = await getContext();
  const result = await graphql(schema, query, rootValue, context);

  expect(sanitizeTestObject(result)).toMatchSnapshot();
});
