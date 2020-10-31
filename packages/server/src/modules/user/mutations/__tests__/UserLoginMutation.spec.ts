import { graphql } from 'graphql';

import { sanitizeTestObject } from '@booksapp/test-utils';

import { schema } from '../../../../graphql/schema';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createUser,
  disconnectMongoose,
  getContext,
  gql,
} from '../../../../../test/helpers';
import { getPlatform, PLATFORM } from '../../../../common/utils';
import { SESSION_TOKEN_SCOPES } from '../../../sessionToken/SessionTokenModel';
import { generateToken } from '../../../auth/generateToken';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('UserLoginMutation', () => {
  it('should login an user', async () => {
    const password = '123456';
    const user = await createUser({ password });

    const mutation = gql`
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
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    const token = await generateToken(context, user, getPlatform(context.appplatform), SESSION_TOKEN_SCOPES.SESSION);

    expect(result.errors).toBeUndefined();
    expect(result.data?.UserLogin.error).toBe(null);
    expect(result.data?.UserLogin.token).not.toBe(null);
    expect(result.data?.UserLogin.token).toBe(token);
    expect(sanitizeTestObject(result, ['token'])).toMatchSnapshot();
  });

  it('should check for invalid credentials', async () => {
    const user = await createUser({ password: '123456' });

    const mutation = gql`
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
        password: 'asdfgh',
      },
    };
    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.UserLogin.error).toBe('Invalid credentials.');
    expect(result.data?.UserLogin.token).toBe(null);
    expect(sanitizeTestObject(result, ['token'])).toMatchSnapshot();
  });

  it('should not login with invalid email', async () => {
    await createUser({ password: '123456' });

    const mutation = gql`
      mutation M($input: UserLoginInput!) {
        UserLogin(input: $input) {
          token
          error
        }
      }
    `;

    const variables = {
      input: {
        email: 'awesome@xyz',
        password: '123456',
      },
    };
    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.UserLogin.error).toBe('The email must be a valid email.');
    expect(result.data?.UserLogin.token).toBe(null);
  });

  it('should not login using password with less than 6 character', async () => {
    const user = await createUser();

    const mutation = gql`
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
        password: '1234',
      },
    };
    const rootValue = {};
    const context = await getContext();
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.UserLogin.error).toBe('Password must be at least 6 characters.');
    expect(result.data?.UserLogin.token).toBe(null);
  });
});
