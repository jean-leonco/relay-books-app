import { sanitizeTestObject, httpRequestGraphql } from '@booksapp/test-utils';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createSessionToken,
  createUser,
  disconnectMongoose,
  gql,
} from '../../../../test/helpers';

import app from '../../../graphql/app';
import { jwtSign } from '../generateToken';
import { PLATFORM } from '../../../common/utils';
import SessionTokenModel, { ISessionToken, SESSION_TOKEN_SCOPES } from '../../sessionToken/SessionTokenModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('authMiddleware', () => {
  it('should not allow requests without appplatform', async () => {
    const user = await createUser();
    const sessionToken = await createSessionToken({ user });

    const token = jwtSign(sessionToken);

    const query = gql`
      query Q {
        me {
          id
          name
        }
      }
    `;

    const payload = { query, variables: {} };
    const response = await httpRequestGraphql(payload, { authorization: `JWT ${token}` }, app);

    expect(response.status).toBe(403);
    expect(response.body).toMatchSnapshot();
  });

  it('should allow requests with known appplatform', async () => {
    const user = await createUser();
    const sessionToken = await createSessionToken({ user });

    const token = jwtSign(sessionToken);

    const query = gql`
      query Q {
        me {
          id
          name
        }
      }
    `;

    const payload = { query, variables: {} };

    const response = await httpRequestGraphql(
      payload,
      { authorization: `JWT ${token}`, appplatform: PLATFORM.APP },
      app,
    );

    expect(response.status).toBe(200);
    expect(sanitizeTestObject(response.body)).toMatchSnapshot();
  });

  it('should not allow requests with blocked SessionToken', async () => {
    const user = await createUser();
    const sessionToken = await createSessionToken({ user, isBlocked: true });

    const query = gql`
      query Q {
        me {
          email
        }
      }
    `;

    const token = jwtSign(sessionToken);

    const variables = {};
    const payload = {
      query,
      variables,
    };
    const header = {
      authorization: `JWT ${token}`,
      appplatform: PLATFORM.APP,
    };

    const response = await httpRequestGraphql(payload, header, app);

    const sessionTokens = await SessionTokenModel.find().lean<ISessionToken>();
    expect(sessionTokens.length).toBe(1);
    expect(response.status).toBe(401);
    expect(response.body).toMatchSnapshot();
  });

  it('should not allow requests if sessionToken has different scope than SESSION_TOKEN_SCOPES.SESSION', async () => {
    const user = await createUser();
    const sessionToken = await createSessionToken({ user, scope: SESSION_TOKEN_SCOPES.RESET_PASSWORD });

    const query = gql`
      query Q {
        me {
          email
        }
      }
    `;

    const token = jwtSign(sessionToken);

    const variables = {};
    const payload = { query, variables };
    const header = {
      authorization: `JWT ${token}`,
      appplatform: PLATFORM.APP,
    };

    const response = await httpRequestGraphql(payload, header, app);

    const sessionTokens = await SessionTokenModel.find().lean<ISessionToken>();
    expect(sessionTokens.length).toBe(1);
    expect(response.status).toBe(401);
    expect(response.body).toMatchSnapshot();
  });

  it('should allow requests with sessionToken scope being SESSION_TOKEN_SCOPES.SESSION', async () => {
    const user = await createUser();
    const sessionToken = await createSessionToken({ user });

    const query = gql`
      query Q {
        me {
          email
        }
      }
    `;

    const token = jwtSign(sessionToken);

    const variables = {};
    const payload = { query, variables };
    const header = {
      authorization: `JWT ${token}`,
      appplatform: PLATFORM.APP,
    };

    const response = await httpRequestGraphql(payload, header, app);

    const sessionTokens = await SessionTokenModel.find().lean<ISessionToken>();
    expect(sessionTokens.length).toBe(1);
    expect(response.status).toBe(200);
    expect(response.body).toMatchSnapshot();
  });
});
