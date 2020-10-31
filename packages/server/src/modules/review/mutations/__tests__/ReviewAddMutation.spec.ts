import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { schema } from '../../../../graphql/schema';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createBook,
  createReading,
  createReview,
  createUser,
  disconnectMongoose,
  getContext,
  gql,
} from '../../../../../test/helpers';
import { PLATFORM } from '../../../../common/utils';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReviewAddMutation', () => {
  it('should create a review', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });
    await createReading({ readPages: 10 });
    const rating = 4.0;
    const description = 'Wow! this is terrible';

    const mutation = gql`
      mutation M($input: ReviewAddInput!) {
        ReviewAdd(input: $input) {
          reviewEdge {
            node {
              id
              rating
              book {
                name
              }
              user {
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
        rating,
        description,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewAdd.error).toBe(null);
    expect(result.data?.ReviewAdd.reviewEdge).not.toBe(null);
    expect(result.data?.ReviewAdd.reviewEdge.node.rating).toBe(rating);
    expect(result.data?.ReviewAdd.reviewEdge.node.book.name).toBe(book.name);
    expect(result.data?.ReviewAdd.reviewEdge.node.user.name).toBe(user.name);
  });

  it('should not create a review without user', async () => {
    const book = await createBook();
    const rating = 4.0;

    const mutation = gql`
      mutation M($input: ReviewAddInput!) {
        ReviewAdd(input: $input) {
          reviewEdge {
            node {
              id
              rating
              book {
                name
              }
              user {
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
        rating,
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewAdd.error).toBe('Unauthorized');
    expect(result.data?.ReviewAdd.reviewEdge).toBe(null);
  });

  it('should not create a review with description over 280 characters', async () => {
    const user = await createUser();
    const book = await createBook();
    const rating = 4.0;
    const description = new Array(282).join('a'); // 281 letters

    const mutation = gql`
      mutation M($input: ReviewAddInput!) {
        ReviewAdd(input: $input) {
          reviewEdge {
            node {
              id
              rating
              book {
                name
              }
              user {
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
        rating,
        description,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewAdd.error).toBe('The description must be less than 280 characters.');
    expect(result.data?.ReviewAdd.reviewEdge).toBe(null);
  });

  it('should not create a review with invalid book id', async () => {
    const user = await createUser();
    const rating = 4.0;

    const mutation = gql`
      mutation M($input: ReviewAddInput!) {
        ReviewAdd(input: $input) {
          reviewEdge {
            node {
              id
              rating
              book {
                name
              }
              user {
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
        rating,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewAdd.error).toBe('The book id is invalid.');
    expect(result.data?.ReviewAdd.reviewEdge).toBe(null);
  });

  it('should not create a review without reading the book', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });
    const rating = 4.0;
    const description = 'Wow! this is terrible';

    const mutation = gql`
      mutation M($input: ReviewAddInput!) {
        ReviewAdd(input: $input) {
          reviewEdge {
            node {
              id
              rating
              book {
                name
              }
              user {
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
        rating,
        description,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewAdd.error).toBe('Unable to review book without finishing it.');
    expect(result.data?.ReviewAdd.reviewEdge).toBe(null);
  });

  it('should not create a review without finishing the book', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });
    await createReading({ readPages: 5 });
    const rating = 4.0;
    const description = 'Wow! this is terrible';

    const mutation = gql`
      mutation M($input: ReviewAddInput!) {
        ReviewAdd(input: $input) {
          reviewEdge {
            node {
              id
              rating
              book {
                name
              }
              user {
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
        rating,
        description,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewAdd.error).toBe('Unable to review book without finishing it.');
    expect(result.data?.ReviewAdd.reviewEdge).toBe(null);
  });

  it('should not create a review if one for that book already exists', async () => {
    const user = await createUser();
    const book = await createBook({ pages: 10 });
    await createReading({ readPages: 10 });
    await createReview();
    const rating = 4.0;

    const mutation = gql`
      mutation M($input: ReviewAddInput!) {
        ReviewAdd(input: $input) {
          reviewEdge {
            node {
              id
              rating
              book {
                name
              }
              user {
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
        rating,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewAdd.error).toBe('A review for this book was already created.');
    expect(result.data?.ReviewAdd.reviewEdge).toBe(null);
  });
});
