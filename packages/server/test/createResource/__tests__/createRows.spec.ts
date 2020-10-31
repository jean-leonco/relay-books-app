import { connectMongoose, clearDbAndRestartCounters, disconnectMongoose } from '../../helpers';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('CreateRows tests', () => {
  it('should test rows creation', async () => {
    expect(1).toBe(1);
  });
});
