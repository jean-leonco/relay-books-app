import { graphql } from 'graphql';

import { sanitizeTestObject } from '@booksapp/test-utils';

import { schema } from '../../../graphql/schema';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createUser,
  disconnectMongoose,
  getContext,
  gql,
} from '../../../../test/helpers';
import { User } from '../../../models';

beforeAll(connectMongoose);

beforeEach(async () => {
  await clearDbAndRestartCounters();
  await User.createIndexes();
});

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
