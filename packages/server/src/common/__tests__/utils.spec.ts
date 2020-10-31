import { toGlobalId } from 'graphql-relay';
import { Types } from 'mongoose';

import { getObjectId, getPlatform, PLATFORM } from '../utils';
import { clearDbAndRestartCounters, connectMongoose, createUser, disconnectMongoose } from '../../../test/helpers';

describe('getObjectId', () => {
  beforeAll(connectMongoose);

  beforeEach(clearDbAndRestartCounters);

  afterAll(disconnectMongoose);

  it('should return an ObjectId when target is ObjectId', async () => {
    const user = await createUser();

    const result = getObjectId(user._id);

    expect(result instanceof Types.ObjectId).toBe(true);
    expect(result?.equals(user._id)).toBe(true);
  });

  it('should return an ObjectId when target is Document', async () => {
    const user = await createUser();

    const result = getObjectId(user);

    expect(result instanceof Types.ObjectId).toBe(true);
    expect(result?.equals(user._id)).toBe(true);
  });

  it('should return an ObjectId when target is a GlobalId', async () => {
    const user = await createUser();

    const result = getObjectId(toGlobalId('User', user._id));

    expect(result instanceof Types.ObjectId).toBe(true);
    expect(result?.equals(user._id)).toBe(true);
  });

  it('should return an ObjectId from a getObjectId getObjectId', async () => {
    const user = await createUser();

    const result = getObjectId(getObjectId(toGlobalId('User', user._id)));

    expect(result instanceof Types.ObjectId).toBe(true);
    expect(result?.equals(user._id)).toBe(true);
  });

  it('should return null on invalid ObjectId', () => {
    expect(getObjectId('something')).toBe(null);
  });

  it('should return null on invalid Object', () => {
    const invalidDoc = { name: 'invalid' };

    expect(getObjectId(invalidDoc)).toBe(null);
  });

  it('should return null on invalid GlobalId', () => {
    const result = getObjectId(toGlobalId('User', 'invalid'));

    expect(result).toBe(null);
  });

  it('should return null when target is date', () => {
    const result1 = getObjectId(new Date());

    expect(result1).toBe(null);
  });

  it('should return null when target is an array', async () => {
    const user = await createUser();
    const userGlobalId = toGlobalId('User', user._id);
    const target = [userGlobalId];

    const result = getObjectId(target);

    expect(target.length).toBe(1);
    expect(target[0]).toEqual(userGlobalId);
    expect(result).toBe(null);
  });
});

describe('PLATFORM', () => {
  it('should validate getPlatform', () => {
    let result = getPlatform(undefined);
    expect(result).toBe(PLATFORM.UNKNOWN);

    result = getPlatform(null);
    expect(result).toBe(PLATFORM.UNKNOWN);

    result = getPlatform(PLATFORM.APP);
    expect(result).toBe(PLATFORM.APP);

    result = getPlatform('test');
    expect(result).toBe(PLATFORM.UNKNOWN);
  });
});
