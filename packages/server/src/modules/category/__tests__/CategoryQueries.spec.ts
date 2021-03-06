import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  gql,
  sanitizeTestObject,
} from '@workspace/test-utils';

import schema from '../../../schema/schema';
import { createCategory, createUser, getContext } from '../../../test/utils';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('CategoryQueries', () => {
  it('should get category from node interface', async () => {
    const user = await createUser();
    const category = await createCategory();

    const query = gql`
      query Q($id: ID!) {
        category: node(id: $id) {
          ... on Category {
            id
            name
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      id: toGlobalId('Category', category._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.category).not.toBe(null);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should not get category without user', async () => {
    const category = await createCategory();

    const query = gql`
      query Q($id: ID!) {
        category: node(id: $id) {
          ... on Category {
            id
            name
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const variables = {
      id: toGlobalId('Category', category._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.category).toBe(null);
  });

  it('should get null Category if isActive is false', async () => {
    const user = await createUser();
    const event = await createCategory({ isActive: false });

    const query = gql`
      query Q($id: ID!) {
        category: node(id: $id) {
          ... on Category {
            id
            name
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      id: toGlobalId('Category', event._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.category).toBe(null);
  });

  it('should query a connection of categories', async () => {
    const user = await createUser();

    for (let i = 0; i < 6; i++) {
      await createCategory();
    }

    const query = gql`
      query Q {
        categories(first: 5) {
          count
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {};

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.categories).not.toBe(null);
    expect(result.data?.categories.edges.length).toBe(5);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a connection of categories with orderBy filter', async () => {
    const user = await createUser();
    const category1 = await createCategory();
    const category2 = await createCategory();
    const category3 = await createCategory();

    const query = gql`
      query Q($filters: CategoryFilters) {
        categories(filters: $filters) {
          count
          edges {
            node {
              id
              key
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      filters: {
        orderBy: { field: 'CREATED_AT', direction: 'ASC' },
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.categories).not.toBe(null);
    expect(result.data?.categories.edges.length).toBe(3);
    expect(result.data?.categories.edges[0].node.key).toBe(category1.key);
    expect(result.data?.categories.edges[1].node.key).toBe(category2.key);
    expect(result.data?.categories.edges[2].node.key).toBe(category3.key);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query only active categories', async () => {
    const user = await createUser();

    for (let i = 0; i < 5; i++) {
      await createCategory();
    }

    for (let i = 0; i < 10; i++) {
      await createCategory({ isActive: false });
    }

    const query = gql`
      query Q {
        categories {
          count
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {};

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.categories).not.toBe(null);
    expect(result.data?.categories.edges.length).toBe(5);
  });
});
