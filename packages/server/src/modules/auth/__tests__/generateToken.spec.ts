import { httpRequestGraphql } from '@booksapp/test-utils';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createUser,
  disconnectMongoose,
  gql,
} from '../../../../test/helpers';

import app from '../../../graphql/app';
import { PLATFORM } from '../../../common/utils';
import SessionTokenModel, { ISessionToken, SESSION_TOKEN_SCOPES } from '../../sessionToken/SessionTokenModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('generateToken and SessionTokenModel', () => {
  it('should check if generateToken produces SESSION token with expected scope', async () => {
    const user = await createUser({ password: '123456' });

    const loginQuery = gql`
      mutation M($input: UserLoginInput!) {
        UserLogin(input: $input) {
          error
        }
      }
    `;

    const loginVariables = {
      input: {
        email: user.email.email,
        password: '123456',
      },
    };
    const loginPayload = {
      query: loginQuery,
      variables: loginVariables,
    };
    const loginHeader = {
      appplatform: PLATFORM.APP,
    };

    const loginResponse = await httpRequestGraphql(loginPayload, loginHeader, app);
    expect(loginResponse.status).toEqual(200);
    expect(loginResponse.body).toEqual({
      data: {
        UserLogin: {
          error: null,
        },
      },
    });

    const sessionTokens = await SessionTokenModel.find().lean<ISessionToken>();
    expect(sessionTokens.length).toBe(1);
    expect(sessionTokens[0].user).toEqual(user._id);
    expect(sessionTokens[0].scope).toEqual(SESSION_TOKEN_SCOPES.SESSION);
    expect(sessionTokens[0].channel).toEqual(PLATFORM.APP);
  });

  it('should reuse SESSION token', async () => {
    const user = await createUser({ password: '123456' });

    const header = {
      appplatform: PLATFORM.APP,
    };

    const loginQuery = gql`
      mutation M($input: UserLoginInput!) {
        UserLogin(input: $input) {
          error
        }
      }
    `;

    const loginVariables = {
      input: {
        email: user.email.email,
        password: '123456',
      },
    };
    const loginPayload = {
      query: loginQuery,
      variables: loginVariables,
    };

    for (let i = 0; i < 3; i++) {
      const loginResponse = await httpRequestGraphql(loginPayload, header, app);
      expect(loginResponse.status).toEqual(200);
      expect(loginResponse.body).toEqual({
        data: {
          UserLogin: {
            error: null,
          },
        },
      });
    }

    const sessionTokens = await SessionTokenModel.find().lean<ISessionToken>();

    expect(sessionTokens.length).toBe(1);
    expect(sessionTokens[0].scope).toEqual(SESSION_TOKEN_SCOPES.SESSION);
  });
});
