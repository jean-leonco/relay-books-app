import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { schema } from '../../../../graphql/schema';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createBook,
  createReading,
  createUser,
  disconnectMongoose,
  getContext,
  gql,
} from '../../../../../test/helpers';
import { PLATFORM } from '../../../../common/utils';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReadingEditPageMutation', () => {
  it('should edit a reading', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });
    const reading = await createReading();
    const currentPage = 4;

    const mutation = gql`
      mutation M($input: ReadingEditPageInput!) {
        ReadingEditPage(input: $input) {
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
        id: toGlobalId('Reading', reading._id),
        currentPage,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingEditPage.error).toBe(null);
    expect(result.data?.ReadingEditPage.readingEdge).not.toBe(null);
    expect(result.data?.ReadingEditPage.readingEdge.node.readPages).toBe(currentPage);
    expect(result.data?.ReadingEditPage.readingEdge.node.book.name).toBe(book.name);
  });

  it('should not edit a reading without user', async () => {
    await createBook({ pages: 10 });
    const reading = await createReading();
    const currentPage = 4;

    const mutation = gql`
      mutation M($input: ReadingEditPageInput!) {
        ReadingEditPage(input: $input) {
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
        id: toGlobalId('Reading', reading._id),
        currentPage,
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingEditPage.error).toBe('Unauthorized');
    expect(result.data?.ReadingEditPage.readingEdge).toBe(null);
  });

  it('should not edit a reading with invalid reading id', async () => {
    const user = await createUser();
    const currentPage = 4;

    const mutation = gql`
      mutation M($input: ReadingEditPageInput!) {
        ReadingEditPage(input: $input) {
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
        id: toGlobalId('Reading', user._id),
        currentPage,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingEditPage.error).toBe('Book not found.');
    expect(result.data?.ReadingEditPage.readingEdge).toBe(null);
  });

  it('should not edit a reading that belongs to other user', async () => {
    await createBook({ pages: 10 });
    const reading = await createReading();
    const user = await createUser();
    const currentPage = 4;

    const mutation = gql`
      mutation M($input: ReadingEditPageInput!) {
        ReadingEditPage(input: $input) {
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
        id: toGlobalId('Reading', reading._id),
        currentPage,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingEditPage.error).toBe('Book not found.');
    expect(result.data?.ReadingEditPage.readingEdge).toBe(null);
  });

  it('should not edit a reading if the read pages is bigger than the book size', async () => {
    const user = await createUser();
    await createBook({ pages: 2 });
    const reading = await createReading();
    const currentPage = 4;

    const mutation = gql`
      mutation M($input: ReadingEditPageInput!) {
        ReadingEditPage(input: $input) {
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
        id: toGlobalId('Reading', reading._id),
        currentPage,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingEditPage.error).toBe(
      'Current page should not be larger than the number of pages in the book.',
    );
    expect(result.data?.ReadingEditPage.readingEdge).toBe(null);
  });
});
