import { graphql } from 'graphql';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  gql,
  sanitizeTestObject,
} from '@workspace/test-utils';

import schema from '../../../schema/schema';
import { createUser, getContext } from '../../../test/utils';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('UserQueries', () => {
  it('should query an me', async () => {
    const user = await createUser();

    const query = gql`
      query Q {
        me {
          id
          name
          email
        }
      }
    `;

    const variables = {};
    const rootValue = {};
    const context = await getContext({ user });
    const result = await graphql(schema, query, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(sanitizeTestObject(result)).toMatchSnapshot();
  });
});
