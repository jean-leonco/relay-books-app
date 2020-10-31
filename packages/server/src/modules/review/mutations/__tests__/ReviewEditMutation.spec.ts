import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { schema } from '../../../../graphql/schema';

import {
  clearDbAndRestartCounters,
  connectMongoose,
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

describe('ReviewEditMutation', () => {
  it('should edit a review', async () => {
    const user = await createUser();
    const review = await createReview();
    const rating = 4.0;
    const description = 'Wow! this is terrible';

    const mutation = gql`
      mutation M($input: ReviewEditInput!) {
        ReviewEdit(input: $input) {
          reviewEdge {
            node {
              id
              rating
              description
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
        id: toGlobalId('Review', review._id),
        rating,
        description,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewEdit.error).toBe(null);
    expect(result.data?.ReviewEdit.reviewEdge).not.toBe(null);
    expect(result.data?.ReviewEdit.reviewEdge.node.rating).toBe(rating);
    expect(result.data?.ReviewEdit.reviewEdge.node.description).toBe(description);
    expect(result.data?.ReviewEdit.reviewEdge.node.user.name).toBe(user.name);
  });

  it('should not edit a review without user', async () => {
    const rating = 4.0;
    const review = await createReview();

    const mutation = gql`
      mutation M($input: ReviewEditInput!) {
        ReviewEdit(input: $input) {
          reviewEdge {
            node {
              id
              rating
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
        id: toGlobalId('Review', review._id),
        rating,
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewEdit.error).toBe('Unauthorized');
    expect(result.data?.ReviewEdit.reviewEdge).toBe(null);
  });

  it('should not edit a review with description over 280 characters', async () => {
    const user = await createUser();
    const review = await createReview();
    const description = new Array(282).join('a'); // 281 letters

    const mutation = gql`
      mutation M($input: ReviewEditInput!) {
        ReviewEdit(input: $input) {
          reviewEdge {
            node {
              id
              rating
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
        id: toGlobalId('Review', review._id),
        description,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewEdit.error).toBe('The description must be less than 280 characters.');
    expect(result.data?.ReviewEdit.reviewEdge).toBe(null);
  });

  it('should not edit a review with invalid review id', async () => {
    const user = await createUser();
    const rating = 4.0;

    const mutation = gql`
      mutation M($input: ReviewEditInput!) {
        ReviewEdit(input: $input) {
          reviewEdge {
            node {
              id
              rating
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
        id: toGlobalId('Review', user._id),
        rating,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewEdit.error).toBe('Review not found.');
    expect(result.data?.ReviewEdit.reviewEdge).toBe(null);
  });

  it('should not edit a review that belongs to other user', async () => {
    const review = await createReview();
    const user = await createUser();
    const rating = 4.0;

    const mutation = gql`
      mutation M($input: ReviewEditInput!) {
        ReviewEdit(input: $input) {
          reviewEdge {
            node {
              id
              rating
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
        id: toGlobalId('Review', review._id),
        rating,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewEdit.error).toBe('Review not found.');
    expect(result.data?.ReviewEdit.reviewEdge).toBe(null);
  });
});
