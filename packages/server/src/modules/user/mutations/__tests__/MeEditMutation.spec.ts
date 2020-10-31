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
import { PLATFORM } from '../../../../common/utils';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('MeEditMutation', () => {
  it('should edit me', async () => {
    const user = await createUser();

    const name = 'Awesome Name';
    const email = 'email@newmail.com';

    const mutation = gql`
      mutation M($input: MeEditInput!) {
        MeEdit(input: $input) {
          me {
            id
            fullName
            email
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        name,
        email,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.MeEdit.error).toBe(null);
    expect(result.data?.MeEdit.me.fullName).toBe(name);
    expect(result.data?.MeEdit.me.email).toBe(email);
    expect(sanitizeTestObject(result)).toMatchSnapshot();
  });

  it('should not edit without me', async () => {
    const name = 'Awesome Name';
    const email = 'email@newmail.com';

    const mutation = gql`
      mutation M($input: MeEditInput!) {
        MeEdit(input: $input) {
          me {
            id
            fullName
            email
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        name,
        email,
      },
    };
    const rootValue = {};
    const context = await getContext({ appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.MeEdit.error).toBe('Unauthorized');
    expect(result.data?.MeEdit.me).toBe(null);
  });

  it('should not edit me with invalid email', async () => {
    const user = await createUser();

    const name = 'jean';
    const email = 'blablabla';

    const mutation = gql`
      mutation M($input: MeEditInput!) {
        MeEdit(input: $input) {
          me {
            id
            email
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        name,
        email,
      },
    };
    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.MeEdit.error).toBe('The email must be a valid email.');
    expect(result.data?.MeEdit.me).toBe(null);
  });

  it('should not edit me using password with less than 6 characters', async () => {
    const user = await createUser();

    const name = 'jean';
    const email = 'email@newmail.com';
    const password = '1234';

    const mutation = gql`
      mutation M($input: MeEditInput!) {
        MeEdit(input: $input) {
          me {
            id
            email
          }
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
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.MeEdit.error).toBe('Password must be at least 6 characters.');
    expect(result.data?.MeEdit.me).toBe(null);
  });

  it('should not edit me if email belongs to another user', async () => {
    const testUser = await createUser();
    const user = await createUser();

    const name = 'jean';
    const password = '123456';

    const mutation = gql`
      mutation M($input: MeEditInput!) {
        MeEdit(input: $input) {
          me {
            id
            email
          }
          error
        }
      }
    `;

    const variables = {
      input: {
        name,
        email: testUser.email.email,
        password,
      },
    };

    const rootValue = {};
    const context = await getContext({ user, appplatform: PLATFORM.APP });
    const result = await graphql(schema, mutation, rootValue, context, variables);

    expect(result.errors).toBeUndefined();
    expect(result.data?.MeEdit.error).toBe('The email is already associated with another account.');
    expect(result.data?.MeEdit.me).toBe(null);
  });
});
