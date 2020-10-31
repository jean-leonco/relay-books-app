import { sanitizeTestObject } from '@booksapp/test-utils';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  createSessionToken,
  disconnectMongoose,
} from '../../../../test/helpers';

import SessionTokenModel from '../SessionTokenModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('SessionTokenModel', () => {
  it('should create as many session token records as needed', async () => {
    // creating 5 session tokens with same ip, channel and scope
    await createSessionToken();
    await createSessionToken();
    await createSessionToken();
    await createSessionToken();
    await createSessionToken();

    await SessionTokenModel.createIndexes();

    const sessionTokens = await SessionTokenModel.find().lean();

    expect(sessionTokens.length).toBe(5);
    expect(sanitizeTestObject(sessionTokens)).toMatchSnapshot();
  });
});
