import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  gql,
  httpRequestGraphql,
} from '@workspace/test-utils';

import app from '../../../app';

import { PLATFORM } from '../../../security';
import { createUser, getContext } from '../../../test/utils';
import TokenModel, { IToken, TOKEN_SCOPES } from '../../token/TokenModel';

import UserModel from '../../user/UserModel';
import { generateToken } from '../generateToken';
import validateJWTToken from '../validateJWTToken';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('sessionManagement', () => {
  it('should login and return a valid token', async () => {
    const password = 'naotemsenha';
    const user = await createUser({ password });

    const query = gql`
      mutation M($input: UserLoginInput!) {
        UserLogin(input: $input) {
          token
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

    const tokens = await TokenModel.find().lean<IToken>();
    expect(tokens.length).toBe(1);
    expect(tokens[0].userId).toEqual(user._id);
    expect(tokens[0].scope).toEqual(TOKEN_SCOPES.SESSION);

    const context = await getContext();

    const loginToken = await generateToken({ ctx: context, user, scope: TOKEN_SCOPES.SESSION, platform: PLATFORM.APP });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      data: {
        UserLogin: {
          token: loginToken,
          error: null,
        },
      },
    });

    const token = await validateJWTToken(context, response.body.data.UserLogin.token);
    expect(token.error).toBeUndefined();
    expect(token.token!.id).toEqual(user.id);
  });

  it('should login and return a valid token that allows access to protected mutations', async () => {
    const password = 'naotemsenha';
    const user = await createUser({ name: 'Velho Nome', password });

    const loginQuery = gql`
      mutation M($input: UserLoginInput!) {
        UserLogin(input: $input) {
          token
          error
        }
      }
    `;

    const loginVariables = {
      input: {
        email: user.email.email,
        password,
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

    const tokens = await TokenModel.find().lean<IToken>();
    expect(tokens.length).toBe(1);
    expect(tokens[0].userId).toEqual(user._id);
    expect(tokens[0].scope).toEqual(TOKEN_SCOPES.SESSION);

    const { token } = loginResponse.body.data.UserLogin;

    const editQuery = gql`
      mutation M($input: MeEditInput!) {
        MeEdit(input: $input) {
          me {
            fullName
          }
          error
        }
      }
    `;

    const editVariables = {
      input: {
        name: 'novo nome',
      },
    };
    const editPayload = {
      query: editQuery,
      variables: editVariables,
    };
    const editHeader = {
      authorization: `JWT ${token}`,
      appplatform: PLATFORM.APP,
    };

    const editResponse = await httpRequestGraphql(editPayload, editHeader, app);

    expect(editResponse.status).toEqual(200);
    expect(editResponse.body).toEqual({
      data: {
        MeEdit: {
          me: {
            fullName: 'novo nome',
          },
          error: null,
        },
      },
    });

    const modifiedUser = await UserModel.findById(user._id).lean();
    expect(modifiedUser?.name).toEqual('novo');
  });
});
