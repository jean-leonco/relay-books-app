import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { clearDbAndRestartCounters, connectMongoose, disconnectMongoose, gql } from '@workspace/test-utils';

import schema from '../../../../schema/schema';
import { PLATFORM } from '../../../../security';

import { createReview, createUser, getContext } from '../../../../test/utils';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReviewRemoveMutation', () => {
  it('should remove a review', async () => {
    const user = await createUser();
    const review = await createReview();

    const mutation = gql`
      mutation M($input: ReviewRemoveInput!) {
        ReviewRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('Review', review._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewRemove.error).toBe(null);
    expect(result.data?.ReviewRemove.success).toBe(true);
  });

  it('should not remove a review without user', async () => {
    const review = await createReview();

    const mutation = gql`
      mutation M($input: ReviewRemoveInput!) {
        ReviewRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('Review', review._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewRemove.error).toBe('Unauthorized');
    expect(result.data?.ReviewRemove.success).toBe(false);
  });

  it('should not remove a review with invalid review id', async () => {
    const user = await createUser();

    const mutation = gql`
      mutation M($input: ReviewRemoveInput!) {
        ReviewRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('Review', user._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewRemove.error).toBe('Review not found.');
    expect(result.data?.ReviewRemove.success).toBe(false);
  });

  it('should not remove a review that belongs to other user', async () => {
    const review = await createReview();
    const user = await createUser();

    const mutation = gql`
      mutation M($input: ReviewRemoveInput!) {
        ReviewRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('Review', review._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewRemove.error).toBe('Review not found.');
    expect(result.data?.ReviewRemove.success).toBe(false);
  });

  it('should not remove a review that is not active', async () => {
    const user = await createUser();
    const review = await createReview({ isActive: false });

    const mutation = gql`
      mutation M($input: ReviewRemoveInput!) {
        ReviewRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('Review', review._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReviewRemove.error).toBe('Review not found.');
    expect(result.data?.ReviewRemove.success).toBe(false);
  });
});
