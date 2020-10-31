import { clearDbAndRestartCounters, connectMongoose, disconnectMongoose } from '../../../test/helpers';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('NodeInterface', () => {
  it('should query with node', async () => {
    expect(1).toBe(1);
  });
});
