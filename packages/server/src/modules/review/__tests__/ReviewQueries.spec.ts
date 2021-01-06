import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import {
  sanitizeTestObject,
  connectMongoose,
  clearDbAndRestartCounters,
  disconnectMongoose,
  gql,
} from '@workspace/test-utils';

import { createBook, createReview, createUser, getContext } from '../../../test/utils';

import schema from '../../../schema/schema';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReviewQueries', () => {
  it('should get review from node interface', async () => {
    const user = await createUser();
    const review = await createReview();

    const query = gql`
      query Q($id: ID!) {
        review: node(id: $id) {
          ... on Review {
            id
            rating
            user {
              name
            }
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
      id: toGlobalId('Review', review._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.review).not.toBe(null);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should not get review without user', async () => {
    const review = await createReview();

    const query = gql`
      query Q($id: ID!) {
        review: node(id: $id) {
          ... on Review {
            rating
            user {
              name
            }
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
      id: toGlobalId('Review', review._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.review).toBe(null);
  });

  it('should get null review if isActive is false', async () => {
    const user = await createUser();
    const event = await createReview({ isActive: false });

    const query = gql`
      query Q($id: ID!) {
        review: node(id: $id) {
          ... on Review {
            rating
            user {
              name
            }
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
      id: toGlobalId('Review', event._id),
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.review).toBe(null);
  });

  it('should query a connection of reviews', async () => {
    const user = await createUser();

    for (let i = 0; i < 6; i++) {
      await createReview();
    }

    const query = gql`
      query Q {
        reviews(first: 5) {
          edges {
            node {
              id
              rating
              user {
                name
              }
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
    expect(result.data?.reviews).not.toBe(null);
    expect(result.data?.reviews.edges.length).toBe(5);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a null connection of reviews with there is no user on ctx', async () => {
    for (let i = 0; i < 6; i++) {
      await createReview();
    }

    const query = gql`
      query Q {
        reviews(first: 5) {
          edges {
            node {
              id
              rating
              user {
                name
              }
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
    expect(result.data?.reviews).not.toBe(null);
    expect(result.data?.reviews.edges.length).toBe(0);
  });

  it('should query a connection of reviews with orderBy filter', async () => {
    const user = await createUser();

    const review1 = await createReview();
    const review2 = await createReview();
    const review3 = await createReview();

    const query = gql`
      query Q($filters: ReviewFilters) {
        reviews(filters: $filters) {
          edges {
            node {
              id
              rating
              user {
                name
              }
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
        orderBy: { sort: 'CREATED_AT', direction: 'ASC' },
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.reviews).not.toBe(null);
    expect(result.data?.reviews.edges.length).toBe(3);
    expect(result.data?.reviews.edges[0].node.rating).toBe(review1.rating);
    expect(result.data?.reviews.edges[1].node.rating).toBe(review2.rating);
    expect(result.data?.reviews.edges[2].node.rating).toBe(review3.rating);
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });

  it('should query a connection of reviews with book filter', async () => {
    const user = await createUser();

    const book = await createBook();
    for (let i = 0; i < 5; i++) {
      await createReview();
    }

    const book2 = await createBook();
    for (let i = 0; i < 3; i++) {
      await createReview({ bookId: book2._id });
    }

    const query = gql`
      query Q($filters: ReviewFilters) {
        reviews(filters: $filters) {
          edges {
            node {
              id
              rating
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
        book: toGlobalId('Book', book._id),
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.reviews).not.toBe(null);
    expect(result.data?.reviews.edges.length).toBe(5);
    expect(result.data?.reviews.edges[0].node.book.name).toBe(book.name);
  });

  it('should query a connection of reviews with user filter', async () => {
    const user = await createUser();

    for (let i = 0; i < 3; i++) {
      await createReview();
    }

    const user2 = await createUser();
    for (let i = 0; i < 5; i++) {
      await createReview({ userId: user2._id });
    }

    const query = gql`
      query Q($filters: ReviewFilters) {
        reviews(filters: $filters) {
          edges {
            node {
              id
              rating
              user {
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
        user: toGlobalId('User', user._id),
      },
    };

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.reviews).not.toBe(null);
    expect(result.data?.reviews.edges.length).toBe(3);
    expect(result.data?.reviews.edges[0].node.user.name).toBe(user.name);
  });

  it('should query only active reviews', async () => {
    const user = await createUser();

    for (let i = 0; i < 5; i++) {
      await createReview();
    }

    for (let i = 0; i < 10; i++) {
      await createReview({ isActive: false });
    }

    const query = gql`
      query Q {
        reviews {
          edges {
            node {
              id
              rating
              user {
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
    expect(result.data?.reviews).not.toBe(null);
    expect(result.data?.reviews.edges.length).toBe(5);
  });
});
