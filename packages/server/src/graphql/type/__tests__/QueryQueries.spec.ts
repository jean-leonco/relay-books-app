import { graphql } from 'graphql';

import { sanitizeTestObject } from '@booksapp/test-utils';

import { schema } from '../../schema';

import {
  getContext,
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  createUser,
  gql,
} from '../../../../test/helpers';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('Query queries', () => {
  it('should get me from query', async () => {
    const user = await createUser();

    const query = gql`
      query Q {
        me {
          id
        }
      }
    `;

    const rootValue = {};
    const context = await getContext({ user });

    const variables = {};

    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(sanitizeTestObject(result.data)).toMatchSnapshot();
  });
});
