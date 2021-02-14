import { graphql } from 'graphql';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  gql,
  sanitizeTestObject,
} from '@workspace/test-utils';

import schema from '../../../../schema/schema';
import { PLATFORM, getPlatform } from '../../../../security';

import { createUser, getContext } from '../../../../test/utils';

import { generateToken } from '../../../auth/generateToken';
import { TOKEN_SCOPES } from '../../../token/TokenModel';

import * as UserLoader from '../../UserLoader';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('UserRegistrationMutation', () => {
  it('should registrate an user', async () => {
    const name = 'jean';
    const email = 'jean@gmail.com';
    const password = '123456';

    const mutation = gql`
      mutation M($input: UserRegistrationInput!) {
        UserRegistration(input: $input) {
          token
          error
        }
      }
    `;

    const variables = {
      input: {
        name,
        email,
        password,
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    const user = await UserLoader.findUserByEmail(context, email);
    const token = await generateToken({
      ctx: context,
      user,
      platform: getPlatform(context.appplatform),
      scope: TOKEN_SCOPES.SESSION,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.UserRegistration.error).toBe(null);
    expect(result.data?.UserRegistration.token).toBe(token);
    expect(user?.email.email).toBe(email);
    expect(user?.name).toBe(name);
    expect(sanitizeTestObject(result, ['token'])).toMatchSnapshot();
  });

  it('should not registrate an user with invalid email', async () => {
    const name = 'jean';
    const email = 'blablabla';
    const password = '123456';

    const mutation = gql`
      mutation M($input: UserRegistrationInput!) {
        UserRegistration(input: $input) {
          token
          error
        }
      }
    `;

    const variables = {
      input: {
        name,
        email,
        password,
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.UserRegistration.error).toBe('The email must be a valid email.');
    expect(result.data?.UserRegistration.token).toBe(null);
  });

  it('should not registrate an user using password with less than 6 characters', async () => {
    const name = 'jean';
    const email = 'blablabla';
    const password = '1234';

    const mutation = gql`
      mutation M($input: UserRegistrationInput!) {
        UserRegistration(input: $input) {
          token
          error
        }
      }
    `;

    const variables = {
      input: {
        name,
        email,
        password,
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.UserRegistration.error).toBe('Password must be at least 6 characters.');
    expect(result.data?.UserRegistration.token).toBe(null);
  });

  it('should not registrate user if email belongs to another user', async () => {
    const user = await createUser();
    const name = 'jean';
    const password = '123456';

    const mutation = gql`
      mutation M($input: UserRegistrationInput!) {
        UserRegistration(input: $input) {
          token
          error
        }
      }
    `;

    const variables = {
      input: {
        name,
        email: user.email.email,
        password,
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.UserRegistration.error).toBe('The email is already associated with another account.');
    expect(result.data?.UserRegistration.token).toBe(null);
  });
});
