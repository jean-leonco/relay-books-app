import { httpRequestGraphql } from '@booksapp/test-utils';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createUser,
  disconnectMongoose,
  getContext,
  gql,
} from '../../../../test/helpers';

import app from '../../../graphql/app';

import UserModel from '../../user/UserModel';
import { getPlatform, PLATFORM } from '../../../common/utils';
import SessionTokenModel, { ISessionToken, SESSION_TOKEN_SCOPES } from '../../sessionToken/SessionTokenModel';
import { generateToken } from '../generateToken';
import validateJWTToken from '../validateJWTToken';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('sessionManagement', () => {
  it('should login and return a valid token that allows access to protected mutations', async () => {
    const password = 'naotemsenha';
    const user = await createUser({ name: 'Velho Nome', password });

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

    const response = await httpRequestGraphql(
      payload,
      {
        appplatform: PLATFORM.APP,
      },
      app,
    );

    const sessionTokens = await SessionTokenModel.find().lean<ISessionToken>();
    expect(sessionTokens.length).toBe(1);
    expect(sessionTokens[0].user).toEqual(user._id);
    expect(sessionTokens[0].scope).toEqual(SESSION_TOKEN_SCOPES.SESSION);
    expect(sessionTokens[0].channel).toEqual(PLATFORM.APP);

    const query2 = gql`
      mutation M($input: MeEditInput!) {
        MeEdit(input: $input) {
          me {
            fullName
          }
          error
        }
      }
    `;

    const variables2 = {
      input: {
        name: 'novo nome',
      },
    };

    const payload2 = {
      query: query2,
      variables: variables2,
    };

    const { token } = response.body.data.UserLogin;
    const response2 = await httpRequestGraphql(
      payload2,
      {
        authorization: `JWT ${token}`,
        appplatform: PLATFORM.APP,
      },
      app,
    );

    expect(response2.status).toEqual(200);
    expect(response2.body).toEqual({
      data: {
        MeEdit: {
          me: {
            fullName: 'novo nome',
          },
          error: null,
        },
      },
    });

    const modifiedUser = await UserModel.findById(user._id);
    expect(modifiedUser!.name).toEqual('novo');
  });

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

    const response = await httpRequestGraphql(
      payload,
      {
        appplatform: PLATFORM.APP,
      },
      app,
    );

    const sessionTokens = await SessionTokenModel.find().lean<ISessionToken>();
    expect(sessionTokens.length).toBe(1);
    expect(sessionTokens[0].user).toEqual(user._id);
    expect(sessionTokens[0].scope).toEqual(SESSION_TOKEN_SCOPES.SESSION);
    expect(sessionTokens[0].channel).toEqual(PLATFORM.APP);

    const context = await getContext({ appplatform: PLATFORM.APP });
    const loginToken = await generateToken(
      context,
      user,
      getPlatform(context.appplatform),
      SESSION_TOKEN_SCOPES.SESSION,
    );

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
    expect(token.detailedError).toBeUndefined();
    expect(token.token!.id).toEqual(user.id);
  });
});
