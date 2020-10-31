import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  getContext,
  createReading,
  createUser,
} from '../../../../test/helpers';

import * as ReadingLoader from '../ReadingLoader';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReadingLoader', () => {
  it('should be able to load a reading', async () => {
    const user = await createUser();
    const reading = await createReading();

    const context = await getContext({ user });
    const readingObj = await ReadingLoader.load(context, reading._id);

    expect(readingObj).not.toBe(null);
    expect(readingObj!.bookId).toEqual(reading.bookId);
    expect(readingObj!.readPages).toEqual(reading.readPages);
    expect(readingObj!.bookId).toEqual(reading.bookId);
    expect(readingObj!.userId).toMatchObject(reading.userId);
  });

  it('should not be able to load a reading without context.user', async () => {
    const reading = await createReading();

    const context = await getContext({});
    const readingObj = await ReadingLoader.load(context, reading._id);

    expect(readingObj).toBe(null);
  });

  it('should not be able to load another user reading', async () => {
    const reading = await createReading();
    const user = await createUser();

    const context = await getContext({ user });
    const readingObj = await ReadingLoader.load(context, reading._id);

    expect(readingObj).toBe(null);
  });

  it('should be able to load a list of readings', async () => {
    const user = await createUser();

    for (let i = 0; i < 11; i++) {
      await createReading();
    }

    const context = await getContext({ user });
    const reviewObj = await ReadingLoader.loadReadings(context, {});

    expect(reviewObj).not.toBe(null);
    expect(reviewObj.count).toBe(11);
  });

  it('should be able to load only me list of readings', async () => {
    const user = await createUser();

    for (let i = 0; i < 6; i++) {
      await createReading();
    }

    const user2 = await createUser();
    for (let i = 0; i < 3; i++) {
      await createReading({ userId: user2._id });
    }

    const context = await getContext({ user });
    const reviewObj = await ReadingLoader.loadReadings(context, {});

    expect(reviewObj).not.toBe(null);
    expect(reviewObj.count).toBe(6);
  });

  it('should not be able to load a list of readings without context.user', async () => {
    for (let i = 0; i < 11; i++) {
      await createReading();
    }

    const context = await getContext();
    const readingObj = await ReadingLoader.loadReadings(context, {});

    expect(readingObj).not.toBe(null);
    expect(readingObj.count).toBe(0);
  });
});
