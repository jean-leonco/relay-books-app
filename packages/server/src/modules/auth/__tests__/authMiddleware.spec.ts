import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  gql,
  httpRequestGraphql,
} from '@workspace/test-utils';

import app from '../../../app';

import { PLATFORM } from '../../../security';
import { createToken, createUser } from '../../../test/utils';
import TokenModel, { IToken, TOKEN_SCOPES } from '../../token/TokenModel';

import { jwtSign } from '../generateToken';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('authMiddleware', () => {
  it('should not allow requests with blocked token', async () => {
    const user = await createUser();
    const token = await createToken({ userId: user._id, isBlocked: true });

    const query = gql`
      query Q {
        me {
          email
        }
      }
    `;

    const jwtToken = jwtSign(token);

    const variables = {};
    const payload = {
      query,
      variables,
    };
    const header = {
      authorization: `JWT ${jwtToken}`,
      appplatform: PLATFORM.APP,
    };

    const response = await httpRequestGraphql(payload, header, app);

    const tokens = await TokenModel.find().lean<IToken>();
    expect(tokens.length).toBe(1);
    expect(response.status).toBe(401);
    expect(response.body).toMatchSnapshot();
  });

  it('should not allow requests if token has different scope than SESSION', async () => {
    const user = await createUser();
    const token = await createToken({ userId: user._id, scope: TOKEN_SCOPES.RESET_PASSWORD });

    const query = gql`
      query Q {
        me {
          email
        }
      }
    `;

    const jwtToken = jwtSign(token);

    const variables = {};
    const payload = { query, variables };
    const header = {
      authorization: `JWT ${jwtToken}`,
      appplatform: PLATFORM.APP,
    };

    const response = await httpRequestGraphql(payload, header, app);

    const tokens = await TokenModel.find().lean<IToken>();
    expect(tokens.length).toBe(1);
    expect(response.status).toBe(401);
    expect(response.body).toMatchSnapshot();
  });

  it('should allow requests with token scope being TOKEN_SCOPES.SESSION', async () => {
    const user = await createUser();
    const token = await createToken({ userId: user._id });

    const query = gql`
      query Q {
        me {
          email
        }
      }
    `;

    const jwtToken = jwtSign(token);

    const variables = {};
    const payload = { query, variables };
    const header = {
      authorization: `JWT ${jwtToken}`,
      appplatform: PLATFORM.APP,
    };

    const response = await httpRequestGraphql(payload, header, app);

    const tokens = await TokenModel.find().lean<IToken>();
    expect(tokens.length).toBe(1);
    expect(response.status).toBe(200);
    expect(response.body.data.me.email).toBe(user.email.email);
    expect(response.body).toMatchSnapshot();
  });
});
