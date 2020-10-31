import { httpRequestGraphql, sanitizeTestObject } from '@booksapp/test-utils';

import { clearDbAndRestartCounters, connectMongoose, disconnectMongoose, gql } from '../../../test/helpers';
import app from '../app';
import { PLATFORM } from '../../common/utils';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('App', () => {
  it('should return 200 even when token is null', async () => {
    const query = gql`
      query Q {
        me {
          id
          name
        }
      }
    `;

    const variables = {};
    const payload = { query, variables };

    const response = await httpRequestGraphql(payload, { appplatform: PLATFORM.APP, authorization: null }, app);

    expect(sanitizeTestObject(response.body)).toMatchSnapshot();
    expect(response.status).toBe(200);
  });
});
