import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { schema } from '../../../../graphql/schema';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createBook,
  createUser,
  disconnectMongoose,
  getContext,
  gql,
} from '../../../../../test/helpers';
import { PLATFORM } from '../../../../common/utils';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReadingAddMutation', () => {
  it('should create a reading', async () => {
    const user = await createUser();
    const book = await createBook();

    const mutation = gql`
      mutation M($input: ReadingAddInput!) {
        ReadingAdd(input: $input) {
          readingEdge {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        bookId: toGlobalId('Book', book._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingAdd.error).toBe(null);
    expect(result.data?.ReadingAdd.readingEdge).not.toBe(null);
    expect(result.data?.ReadingAdd.readingEdge.node.readPages).toBe(1);
    expect(result.data?.ReadingAdd.readingEdge.node.book.name).toBe(book.name);
  });

  it('should not create a reading without user', async () => {
    const book = await createBook();

    const mutation = gql`
      mutation M($input: ReadingAddInput!) {
        ReadingAdd(input: $input) {
          readingEdge {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        bookId: toGlobalId('Book', book._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingAdd.error).toBe('Unauthorized');
    expect(result.data?.ReadingAdd.readingEdge).toBe(null);
  });

  it('should not create a reading with invalid book id', async () => {
    const user = await createUser();

    const mutation = gql`
      mutation M($input: ReadingAddInput!) {
        ReadingAdd(input: $input) {
          readingEdge {
            node {
              id
              readPages
              book {
                name
              }
            }
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        bookId: toGlobalId('Book', user._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingAdd.error).toBe('The book id is invalid.');
    expect(result.data?.ReadingAdd.readingEdge).toBe(null);
  });
});
