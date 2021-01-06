import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  sanitizeTestObject,
} from '@workspace/test-utils';

import { createToken, createUser } from '../../../test/utils';

import TokenModel, { IToken, TOKEN_SCOPES } from '../TokenModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('TokenModel', () => {
  it('should be able to create a new token using TokenModel', async () => {
    const user = await createUser();
    const ip = '::ffff:127.0.0.1';
    const expiresIn = new Date('11/23/2020');
    const scope = TOKEN_SCOPES.SESSION;

    const token = await new TokenModel({
      userId: user._id,
      ip,
      scope,
      expiresIn,
    }).save();

    const tokenObj = await TokenModel.findOne({ _id: token._id }).lean<IToken>();

    expect(tokenObj?.userId).toMatchObject(user._id);
    expect(tokenObj?.ip).toBe(ip);
    expect(tokenObj?.scope).toBe(scope);
    expect(tokenObj?.expiresIn).toMatchObject(expiresIn);
    expect(tokenObj?.isBlocked).toBe(false);
    expect(sanitizeTestObject(tokenObj)).toMatchSnapshot();
  });

  it('should be able to create a new token without user', async () => {
    const ip = '::ffff:127.0.0.1';
    const expiresIn = new Date('11/23/2020');
    const scope = TOKEN_SCOPES.SESSION;

    const token = await new TokenModel({
      ip,
      scope,
      expiresIn,
    }).save();

    const tokenObj = await TokenModel.findOne({ _id: token._id }).lean<IToken>();

    expect(tokenObj?.userId).toBe(null);
    expect(tokenObj?.ip).toBe(ip);
    expect(tokenObj?.scope).toBe(scope);
    expect(tokenObj?.expiresIn).toMatchObject(expiresIn);
    expect(tokenObj?.isBlocked).toBe(false);
  });

  it('should be able to create a new token without expiresIn', async () => {
    const user = await createUser();
    const ip = '::ffff:127.0.0.1';
    const scope = TOKEN_SCOPES.SESSION;

    const token = await new TokenModel({
      userId: user._id,
      ip,
      scope,
    }).save();

    const tokenObj = await TokenModel.findOne({ _id: token._id }).lean<IToken>();

    expect(tokenObj?.userId).toMatchObject(user._id);
    expect(tokenObj?.ip).toBe(ip);
    expect(tokenObj?.scope).toBe(scope);
    expect(tokenObj?.expiresIn).toBe(null);
    expect(tokenObj?.isBlocked).toBe(false);
  });

  it('should be able to create a new token using createRow', async () => {
    const ip = '::ffff:127.0.0.1';
    const scope = TOKEN_SCOPES.SESSION;

    const token = await createToken();

    const tokenObj = await TokenModel.findOne({ _id: token._id }).lean<IToken>();

    expect(tokenObj?.ip).toBe(ip);
    expect(tokenObj?.scope).toBe(scope);
    expect(tokenObj?.expiresIn).toBe(null);
    expect(tokenObj?.isBlocked).toBe(false);
  });

  it('should be able to create a new token with custom properties', async () => {
    const ip = '192.168.0.117';
    const scope = TOKEN_SCOPES.RESET_PASSWORD;

    const token = await createToken({ ip, scope });

    const tokenObj = await TokenModel.findOne({ _id: token._id }).lean<IToken>();

    expect(tokenObj?.ip).toBe(ip);
    expect(tokenObj?.scope).toBe(scope);
    expect(tokenObj?.expiresIn).toBe(null);
    expect(tokenObj?.isBlocked).toBe(false);
  });
});
