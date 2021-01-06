import MockDate from 'mockdate';
import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import {
  sanitizeTestObject,
  connectMongoose,
  clearDbAndRestartCounters,
  disconnectMongoose,
  gql,
  resetRunningDate,
  bumpDate,
  N_DAYS_IN_MILLISECONDS,
} from '@workspace/test-utils';

import { createBook, createCategory, createReading, createUser, getContext } from '../../../test/utils';

import schema from '../../../schema/schema';

beforeAll(connectMongoose);

beforeEach(async () => {
  await clearDbAndRestartCounters();
  MockDate.reset();
  resetRunningDate();
  jest.clearAllMocks();
});

afterAll(disconnectMongoose);

describe('BookQueries', () => {
  it('should get book from node interface', async () => {
    const user = await createUser();
    const book = await createBook();

    const query = gql`
      query Q($id: ID!) {
        book: node(id: $id) {
          ... on Book {
            id
            name
            author
            description
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      id: toGlobalId('Book', book._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.book).not.toBe(null);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should not get book without user', async () => {
    const book = await createBook();

    const query = gql`
      query Q($id: ID!) {
        book: node(id: $id) {
          ... on Book {
            id
            name
            author
            description
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const variables = {
      id: toGlobalId('Book', book._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.book).toBe(null);
  });

  it('should get null book if isActive is false', async () => {
    const user = await createUser();
    const event = await createBook({ isActive: false });

    const query = gql`
      query Q($id: ID!) {
        book: node(id: $id) {
          ... on Book {
            id
            name
            author
            description
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      id: toGlobalId('Book', event._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.book).toBe(null);
  });

  it('should query a connection of books', async () => {
    const user = await createUser();

    for (let i = 0; i < 6; i++) {
      await createBook();
    }

    const query = gql`
      query Q {
        books(first: 5) {
          count
          edges {
            node {
              id
              name
              author
              description
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
    expect(result.data?.books).not.toBe(null);
    expect(result.data?.books.edges.length).toBe(5);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a connection of books with search filter', async () => {
    const user = await createUser();

    await createBook({ name: 'TEST 1' });
    await createBook({ author: 'TEST 3' });
    await createBook({ description: 'TEST 2' });
    await createBook({ name: 'DO NOT SEARCH 1' });
    await createBook({ name: 'DO NOT SEARCH 2' });
    await createBook({ name: 'DO NOT SEARCH 3' });

    const query = gql`
      query Q($filters: BookFilters) {
        books(filters: $filters) {
          count
          edges {
            node {
              id
              name
              author
              description
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      filters: { search: 'TEST' },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.books).not.toBe(null);
    expect(result.data?.books.edges.length).toBe(3);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a connection of books with orderBy filter', async () => {
    const user = await createUser();
    const book1 = await createBook();
    const book2 = await createBook();
    const book3 = await createBook();

    const query = gql`
      query Q($filters: BookFilters) {
        books(filters: $filters) {
          count
          edges {
            node {
              id
              name
              author
              description
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
    expect(result.data?.books).not.toBe(null);
    expect(result.data?.books.edges.length).toBe(3);
    expect(result.data?.books.edges[0].node.name).toBe(book1.name);
    expect(result.data?.books.edges[1].node.name).toBe(book2.name);
    expect(result.data?.books.edges[2].node.name).toBe(book3.name);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a connection of books with category filter', async () => {
    const user = await createUser();

    const horrorCategory = await createCategory({ name: 'Horror' });
    for (let i = 0; i < 5; i++) {
      await createBook({ categoryId: horrorCategory._id });
    }

    const comedyCategory = await createCategory({ name: 'Comedy' });
    for (let i = 0; i < 10; i++) {
      await createBook({ categoryId: comedyCategory._id });
    }

    const query = gql`
      query Q($filters: BookFilters) {
        books(filters: $filters) {
          count
          edges {
            node {
              id
              name
              author
              description
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      filters: {
        category: toGlobalId('Category', horrorCategory._id),
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.books).not.toBe(null);
    expect(result.data?.books.edges.length).toBe(5);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a connection of books with trending filter', async () => {
    const user = await createUser();

    const book1 = await createBook();
    for (let i = 0; i < 10; i++) {
      await createReading({ bookId: book1._id });
    }

    const book2 = await createBook();
    for (let i = 0; i < 5; i++) {
      await createReading({ bookId: book2._id });
    }

    const book3 = await createBook();
    for (let i = 0; i < 3; i++) {
      await createReading({ bookId: book3._id });
    }

    const query = gql`
      query Q($filters: BookFilters) {
        books(filters: $filters) {
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
    const variables = {
      filters: {
        trending: true,
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.books).not.toBe(null);
    expect(result.data?.books.edges.length).toBe(3);
    expect(result.data?.books.edges[0].node.name).toBe(book1.name);
    expect(result.data?.books.edges[1].node.name).toBe(book2.name);
    expect(result.data?.books.edges[2].node.name).toBe(book3.name);
  });

  it('should query with trending filter and use creation date to sort if books has the same readings amount', async () => {
    const user = await createUser();

    const book1 = await createBook();
    for (let i = 0; i < 10; i++) {
      await createReading({ bookId: book1._id });
    }

    const book2 = await createBook();
    for (let i = 0; i < 5; i++) {
      await createReading({ bookId: book2._id });
    }

    const book3 = await createBook();
    for (let i = 0; i < 3; i++) {
      await createReading({ bookId: book3._id });
    }

    const book4 = await createBook();
    for (let i = 0; i < 10; i++) {
      await createReading({ bookId: book4._id });
    }

    const query = gql`
      query Q($filters: BookFilters) {
        books(filters: $filters) {
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
    const variables = {
      filters: {
        trending: true,
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.books).not.toBe(null);
    expect(result.data?.books.edges.length).toBe(4);
    expect(result.data?.books.edges[0].node.name).toBe(book4.name);
    expect(result.data?.books.edges[1].node.name).toBe(book1.name);
    expect(result.data?.books.edges[2].node.name).toBe(book2.name);
    expect(result.data?.books.edges[3].node.name).toBe(book3.name);
  });

  it('should query with trending filter and consider only last 7 days', async () => {
    MockDate.set(new Date('10/03/2020'));

    const user = await createUser();

    const book1 = await createBook();
    for (let i = 0; i < 10; i++) {
      await createReading({ bookId: book1._id });
    }

    const book2 = await createBook();
    for (let i = 0; i < 5; i++) {
      await createReading({ bookId: book2._id });
    }

    const book3 = await createBook();
    for (let i = 0; i < 3; i++) {
      await createReading({ bookId: book3._id });
    }

    bumpDate(new Date(), N_DAYS_IN_MILLISECONDS(8));

    for (let i = 0; i < 2; i++) {
      await createReading({ bookId: book1._id });
    }

    for (let i = 0; i < 5; i++) {
      await createReading({ bookId: book2._id });
    }

    for (let i = 0; i < 15; i++) {
      await createReading({ bookId: book3._id });
    }

    const query = gql`
      query Q($filters: BookFilters) {
        books(filters: $filters) {
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
    const variables = {
      filters: {
        trending: true,
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.books).not.toBe(null);
    expect(result.data?.books.edges.length).toBe(3);
    expect(result.data?.books.edges[0].node.name).toBe(book3.name);
    expect(result.data?.books.edges[1].node.name).toBe(book2.name);
    expect(result.data?.books.edges[2].node.name).toBe(book1.name);
  });

  it('should query only active books', async () => {
    const user = await createUser();

    for (let i = 0; i < 5; i++) {
      await createBook();
    }

    for (let i = 0; i < 10; i++) {
      await createBook({ isActive: false });
    }

    const query = gql`
      query Q {
        books {
          count
          edges {
            node {
              id
              name
              author
              description
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
    expect(result.data?.books).not.toBe(null);
    expect(result.data?.books.edges.length).toBe(5);
  });
});
