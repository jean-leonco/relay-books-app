import { sanitizeTestObject } from '@booksapp/test-utils';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createUser,
  disconnectMongoose,
  getContext,
} from '../../../../test/helpers';

import * as UserLoader from '../UserLoader';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('UserLoader functions', () => {
  it('should verify that e-mail already exists', async () => {
    const email = 'jean@gmail.io';
    const user = await createUser({ email: { email, wasVerified: true } });
    const context = await getContext({ user });

    const result = await UserLoader.userEmailExists(context, email);

    expect(result).toBe(1);
  });

  it('should verify that e-mail does not exists', async () => {
    const email = 'jean@gmail.io';
    const user = await createUser({ email: { email, wasVerified: true } });
    const context = await getContext({ user });

    const result = await UserLoader.userEmailExists(context, email + '.br');

    expect(result).toBe(0);
  });

  it('should find user by e-mail', async () => {
    const email = 'jean@gmail.io';
    const user = await createUser({ email: { email, wasVerified: true } });
    const context = await getContext({ user });

    const result = await UserLoader.findUserByEmail(context, email);

    expect(sanitizeTestObject(result)).toMatchSnapshot();
  });
});
