import { graphql, GraphQLBoolean, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLNonNull } from 'graphql';

import * as yup from 'yup';

import {
  clearDbAndRestartCounters,
  connectMongoose,
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

const ValidationSchemaMiddlewareSchema = (): yup.ObjectSchema<yup.Shape<any, any>> => {
  const schema = yup.object().shape({
    name: yup.string().required('Name is required.'),
    description: yup.string().max(140, 'Description should be less than 140'),
  });

  return schema;
};

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ValidationSchemaMiddlewareMutation: {
      name: 'ValidationSchemaMiddlewareMutation',
      type: new GraphQLObjectType({
        name: 'ValidationSchemaResponse',
        fields: () => ({
          error: {
            type: GraphQLString,
          },
        }),
      }),
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString),
        },
        description: {
          type: GraphQLString,
        },
      },
      validationSchema: ValidationSchemaMiddlewareSchema,
      resolve: () => {
        return {
          error: null,
        };
      },
    },
    NoValidationSchemaMiddlewareMutation: {
      name: 'NoValidationSchemaMiddlewareMutation',
      type: new GraphQLObjectType({
        name: 'NoValidationSchemaResponse',
        fields: () => ({
          error: {
            type: GraphQLString,
          },
        }),
      }),
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString),
        },
        description: {
          type: GraphQLString,
        },
      },
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

describe('validationSchemaMutation', () => {
  it('should not execute mutation if validationSchema exists and validation fails', async () => {
    const query = gql`
      mutation M {
        ValidationSchemaMiddlewareMutation(
          name: "Teste",
          description: "${[...Array(141).keys()].map(() => 'T').join('')}",
        ) {
          error
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, query, rootValue, context);

    expect(result.data?.ValidationSchemaMiddlewareMutation.error).toBe('Description should be less than 140');
  });

  it('should execute mutation if validationSchema does not exist', async () => {
    const query = gql`
      mutation M {
        NoValidationSchemaMiddlewareMutation(
          name: "Teste",
          description: "${[...Array(141).keys()].map(() => 'T').join('')}",
        ) {
          error
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, query, rootValue, context);

    expect(result.data?.NoValidationSchemaMiddlewareMutation.error).toBe(null);
  });

  it('should execute mutation if validationSchema exists and validation does not fail', async () => {
    const query = gql`
      mutation M {
        ValidationSchemaMiddlewareMutation(name: "Teste", description: "Teste") {
          error
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, query, rootValue, context);

    expect(result.data?.ValidationSchemaMiddlewareMutation.error).toBe(null);
  });
});
