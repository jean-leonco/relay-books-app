import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  gql,
  httpRequestGraphql,
} from '@workspace/test-utils';

import app from '../../../app';

import { PLATFORM } from '../../../security';
import { createUser } from '../../../test/utils';
import TokenModel, { IToken, TOKEN_SCOPES } from '../../token/TokenModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('generateToken', () => {
  it('should produces SESSION token with expected scope', async () => {
    const password = '123456';
    const user = await createUser({ password });

    const query = gql`
      mutation M($input: UserLoginInput!) {
        UserLogin(input: $input) {
          error
        }
      }
    `;

    const variables = {
      input: {
        email: user.email.email,
        password,
      },
    };
    const payload = {
      query,
      variables,
    };
    const header = {
      appplatform: PLATFORM.APP,
    };
    const response = await httpRequestGraphql(payload, header, app);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      data: {
        UserLogin: {
          error: null,
        },
      },
    });

    const tokens = await TokenModel.find().lean<IToken>();

    expect(tokens.length).toBe(1);
    expect(tokens[0].userId).toEqual(user._id);
    expect(tokens[0].scope).toEqual(TOKEN_SCOPES.SESSION);
  });

  it('should reuse SESSION token', async () => {
    const password = '123456';
    const user = await createUser({ password });

    const query = gql`
      mutation M($input: UserLoginInput!) {
        UserLogin(input: $input) {
          error
        }
      }
    `;

    const variables = {
      input: {
        email: user.email.email,
        password,
      },
    };
    const payload = {
      query,
      variables,
    };
    const header = {
      appplatform: PLATFORM.APP,
    };

    for (let i = 0; i < 3; i++) {
      const response = await httpRequestGraphql(payload, header, app);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        data: {
          UserLogin: {
            error: null,
          },
        },
      });
    }

    const tokens = await TokenModel.find().lean<IToken>();

    expect(tokens.length).toBe(1);
    expect(tokens[0].scope).toEqual(TOKEN_SCOPES.SESSION);
  });
});
