import { graphql } from 'graphql';
import { toGlobalId } from 'graphql-relay';

import { connectMongoose, clearDbAndRestartCounters, disconnectMongoose, gql } from '@workspace/test-utils';

import { createUser, createReading, getContext } from '../../../../test/utils';

import { PLATFORM } from '../../../../security';

import schema from '../../../../schema/schema';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReadingRemoveMutation', () => {
  it('should remove a reading', async () => {
    const user = await createUser();
    const reading = await createReading();

    const mutation = gql`
      mutation M($input: ReadingRemoveInput!) {
        ReadingRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('Reading', reading._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingRemove.error).toBe(null);
    expect(result.data?.ReadingRemove.success).toBe(true);
  });

  it('should not remove a reading without user', async () => {
    const reading = await createReading();

    const mutation = gql`
      mutation M($input: ReadingRemoveInput!) {
        ReadingRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('Reading', reading._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingRemove.error).toBe('Unauthorized');
    expect(result.data?.ReadingRemove.success).toBe(false);
  });

  it('should not remove a reading with invalid reading id', async () => {
    const user = await createUser();

    const mutation = gql`
      mutation M($input: ReadingRemoveInput!) {
        ReadingRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('Reading', user._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingRemove.error).toBe('Book not found.');
    expect(result.data?.ReadingRemove.success).toBe(false);
  });

  it('should not remove a reading that belongs to other user', async () => {
    const reading = await createReading();
    const user = await createUser();

    const mutation = gql`
      mutation M($input: ReadingRemoveInput!) {
        ReadingRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('Reading', reading._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingRemove.error).toBe('Book not found.');
    expect(result.data?.ReadingRemove.success).toBe(false);
  });

  it('should not remove a reading that is not active', async () => {
    const user = await createUser();
    const reading = await createReading({ isActive: false });

    const mutation = gql`
      mutation M($input: ReadingRemoveInput!) {
        ReadingRemove(input: $input) {
          success
          error
        }
      }
    `;

    const variables = {
      input: {
        id: toGlobalId('Reading', reading._id),
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.ReadingRemove.error).toBe('Book not found.');
    expect(result.data?.ReadingRemove.success).toBe(false);
  });
});
