import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  sanitizeTestObject,
} from '@workspace/test-utils';

import { PLATFORM } from '../../../security';
import { createToken, createUser, getContext } from '../../../test/utils';

import * as TokenLoader from '../TokenLoader';
import { TOKEN_SCOPES } from '../TokenModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('TokenLoader', () => {
  it('should load null when looking for a invalid token', async () => {
    const user = await createUser();

    await createToken({ userId: user._id, isBlocked: true });

    const context = await getContext({ user });

    const validToken = await TokenLoader.loadValidToken({
      ctx: context,
      user,
      scope: TOKEN_SCOPES.SESSION,
      platform: PLATFORM.APP,
    });

    expect(validToken).toBeNull();
  });

  it('should only load me valid token', async () => {
    const user = await createUser();

    // invalid tokens
    for (let i = 0; i < 3; i++) {
      const notMeUser = await createUser();

      await createToken({ userId: notMeUser._id, isBlocked: i % 2 === 0, isActive: i % 2 !== 0 });
    }

    // valid tokens
    for (let i = 0; i < 3; i++) {
      const notMeUser = await createUser();

      await createToken({ userId: notMeUser._id });
    }

    await createToken({ userId: user._id });

    const context = await getContext({ user });

    const validToken = await TokenLoader.loadValidToken({
      ctx: context,
      user,
      scope: TOKEN_SCOPES.SESSION,
      platform: PLATFORM.APP,
    });

    expect(validToken?.userId).toEqual(user._id);
    expect(sanitizeTestObject(validToken)).toMatchSnapshot();
  });
});
