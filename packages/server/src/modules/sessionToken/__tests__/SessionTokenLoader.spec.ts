import { sanitizeTestObject } from '@booksapp/test-utils';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createSessionToken,
  createUser,
  disconnectMongoose,
  getContext,
} from '../../../../test/helpers';

import * as SessionTokenLoader from '../SessionTokenLoader';
import { PLATFORM } from '../../../common/utils';
import { SESSION_TOKEN_SCOPES } from '../SessionTokenModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('SessionTokenLoader', () => {
  it('should load null when looking for valid session token', async () => {
    const user = await createUser();

    await createSessionToken({ user, isBlocked: true });

    const context = await getContext({ user });

    const validSessionToken = await SessionTokenLoader.loadValidSessionToken(
      context,
      user,
      PLATFORM.APP,
      SESSION_TOKEN_SCOPES.SESSION,
    );

    expect(validSessionToken).toBeNull();
  });

  it('should load a valid session token', async () => {
    const user = await createUser();

    await createSessionToken({ user: await createUser(), isBlocked: true });
    await createSessionToken({ user: await createUser(), isActive: false });
    await createSessionToken({ user });

    const context = await getContext({ user });

    const validSessionToken = await SessionTokenLoader.loadValidSessionToken(
      context,
      user,
      PLATFORM.APP,
      SESSION_TOKEN_SCOPES.SESSION,
    );

    expect(validSessionToken?.user).toEqual(user._id);
    expect(sanitizeTestObject(validSessionToken)).toMatchSnapshot();
  });
});
