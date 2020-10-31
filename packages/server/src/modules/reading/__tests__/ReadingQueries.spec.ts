import MockDate from 'mockdate';
import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { sanitizeTestObject } from '@booksapp/test-utils';

import { schema } from '../../../graphql/schema';

import {
  getContext,
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  createUser,
  createReading,
  resetRunningDate,
  createBook,
  gql,
} from '../../../../test/helpers';

beforeAll(connectMongoose);

beforeEach(async () => {
  await clearDbAndRestartCounters();
  MockDate.reset();
  resetRunningDate();
  jest.clearAllMocks();
});

afterAll(disconnectMongoose);

describe('Reading queries', () => {
  it('should get reading from node interface', async () => {
    const user = await createUser();
    const reading = await createReading();

    const query = gql`
      query Q($id: ID!) {
        reading: node(id: $id) {
          ... on Reading {
            id
            readPages
            book {
              name
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      id: toGlobalId('Reading', reading._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.reading).not.toBe(null);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should not get reading without user', async () => {
    const reading = await createReading();

    const query = gql`
      query Q($id: ID!) {
        reading: node(id: $id) {
          ... on Reading {
            readPages
            book {
              name
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const variables = {
      id: toGlobalId('Reading', reading._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.reading).toBe(null);
  });

  it('should get null reading if isActive is false', async () => {
    const user = await createUser();
    const event = await createReading({ isActive: false });

    const query = gql`
      query Q($id: ID!) {
        reading: node(id: $id) {
          ... on Reading {
            readPages
            book {
              name
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      id: toGlobalId('Reading', event._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.reading).toBe(null);
  });

  it('should get null reading if removedAt exists', async () => {
    const user = await createUser();
    const event = await createReading({ removedAt: new Date() });

    const query = gql`
      query Q($id: ID!) {
        reading: node(id: $id) {
          ... on Reading {
            readPages
            book {
              name
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      id: toGlobalId('Reading', event._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);
    expect(result.errors).toBeUndefined();
    expect(result.data?.reading).toBe(null);
  });

  it('should query a connection of readings', async () => {
    const user = await createUser();

    for (let i = 0; i < 6; i++) {
      await createReading();
    }

    const query = gql`
      query Q {
        readings(first: 5) {
          edges {
            node {
              id
              readPages
              book {
                name
              }
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
    expect(result.data?.readings).not.toBe(null);
    expect(result.data?.readings.edges.length).toBe(5);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a null connection of readings with there is no user on ctx', async () => {
    for (let i = 0; i < 6; i++) {
      await createReading();
    }

    const query = gql`
      query Q {
        readings(first: 5) {
          edges {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext();
    const variables = {};

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readings).not.toBe(null);
    expect(result.data?.readings.edges.length).toBe(0);
  });

  it('should query a connection of readings with orderBy filter', async () => {
    const user = await createUser();

    const reading1 = await createReading({ readPages: 5 });
    const reading2 = await createReading({ readPages: 3 });
    const reading3 = await createReading({ readPages: 200 });

    const query = gql`
      query Q($filters: ReadingFilters) {
        readings(filters: $filters) {
          edges {
            node {
              id
              readPages
              book {
                name
              }
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
    expect(result.data?.readings).not.toBe(null);
    expect(result.data?.readings.edges.length).toBe(3);
    expect(result.data?.readings.edges[0].node.readPages).toBe(reading1.readPages);
    expect(result.data?.readings.edges[1].node.readPages).toBe(reading2.readPages);
    expect(result.data?.readings.edges[2].node.readPages).toBe(reading3.readPages);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a connection of finished readings', async () => {
    const user = await createUser();

    for (let i = 1; i < 4; i++) {
      const book = await createBook({ pages: i * 2 });
      await createReading({ bookId: book._id, readPages: i });
    }

    for (let i = 1; i < 11; i++) {
      const book = await createBook({ pages: i });
      await createReading({ bookId: book._id, readPages: i });
    }

    const query = gql`
      query Q($filters: ReadingFilters) {
        readings(filters: $filters) {
          edges {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      filters: {
        finished: true,
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readings).not.toBe(null);
    expect(result.data?.readings.edges.length).toBe(10);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a connection of unfinished readings', async () => {
    const user = await createUser();

    for (let i = 1; i < 7; i++) {
      const book = await createBook({ pages: i * 2 });
      await createReading({ bookId: book._id, readPages: i });
    }

    for (let i = 1; i < 3; i++) {
      const book = await createBook({ pages: i });
      await createReading({ bookId: book._id, readPages: i });
    }

    const query = gql`
      query Q($filters: ReadingFilters) {
        readings(filters: $filters) {
          edges {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });
    const variables = {
      filters: {
        finished: false,
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.readings).not.toBe(null);
    expect(result.data?.readings.edges.length).toBe(6);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query only active readings', async () => {
    const user = await createUser();

    for (let i = 0; i < 5; i++) {
      await createReading();
    }

    for (let i = 0; i < 5; i++) {
      await createReading({ isActive: false });
    }

    for (let i = 0; i < 5; i++) {
      await createReading({ removedAt: new Date() });
    }

    const query = gql`
      query Q {
        readings {
          edges {
            node {
              id
              readPages
              book {
                name
              }
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
    expect(result.data?.readings).not.toBe(null);
    expect(result.data?.readings.edges.length).toBe(5);
  });
});
